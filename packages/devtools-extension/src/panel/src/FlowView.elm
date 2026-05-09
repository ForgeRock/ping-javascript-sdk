module FlowView exposing (view, viewPlaybackControls)

import Helpers
import Html exposing (Html)
import Html.Attributes exposing (..)
import Html.Events
import Json.Encode as Encode
import JsonTree
import Set exposing (Set)
import Svg exposing (..)
import Svg.Attributes as SA
import Svg.Events
import Types exposing (AuthEvent, EventData(..), JourneyData, NetworkData, NodeData, NodeStatus(..), OidcData)
import Update exposing (Msg(..))


nodeStatusFromEvent : AuthEvent -> NodeStatus
nodeStatusFromEvent event =
    case event.oidcSemantics of
        Just sem ->
            if sem.errorCode /= Nothing then
                StatusError

            else if sem.hasTokens then
                Success

            else
                Continue

        Nothing ->
            case event.data of
                Oidc oidc ->
                    case oidc.status of
                        Just "success" ->
                            Success

                        Just "error" ->
                            StatusError

                        _ ->
                            UnknownStatus

                Journey journey ->
                    case journey.stepType of
                        Just "LoginSuccess" ->
                            Success

                        Just "LoginFailure" ->
                            Failure

                        Just "Step" ->
                            Continue

                        _ ->
                            UnknownStatus

                DaVinciNode node ->
                    Maybe.withDefault UnknownStatus node.nodeStatus

                _ ->
                    UnknownStatus


nodeDisplayLabel : AuthEvent -> String
nodeDisplayLabel event =
    case event.oidcSemantics of
        Just sem ->
            Maybe.withDefault "oidc" sem.oidcPhase

        Nothing ->
            case event.data of
                Oidc oidc ->
                    Maybe.withDefault "oidc" oidc.phase

                Journey journey ->
                    journey.stage
                        |> orMaybe journey.header
                        |> orMaybe journey.stepType
                        |> Maybe.withDefault "—"

                DaVinciNode node ->
                    node.nodeName
                        |> orMaybe node.eventName
                        |> Maybe.withDefault "—"

                _ ->
                    "—"


orMaybe : Maybe a -> Maybe a -> Maybe a
orMaybe fallback primary =
    case primary of
        Just _ ->
            primary

        Nothing ->
            fallback


-- ── SVG Rail ──────────────────────────────────────────────────────────────────


nodeSpacing : Int
nodeSpacing =
    140


nodeRadius : Int
nodeRadius =
    18


railHeight : Int
railHeight =
    110


viewRail : List AuthEvent -> Maybe Int -> Maybe String -> Html Msg
viewRail events playbackIndex selectedNodeId =
    let
        sdkNodes =
            Helpers.sdkNodes events

        visibleNodes =
            case playbackIndex of
                Nothing ->
                    sdkNodes

                Just n ->
                    List.take (n + 1) sdkNodes

        count =
            List.length visibleNodes

        svgWidth =
            if count == 0 then
                200
            else
                count * nodeSpacing + 60
    in
    Html.div [ Html.Attributes.class "fv-rail" ]
        [ if List.isEmpty sdkNodes then
            Html.div [ Html.Attributes.class "fv-rail-empty" ] [ Html.text "No SDK nodes recorded yet." ]

          else
            Svg.svg
                [ SA.width (String.fromInt svgWidth)
                , SA.height (String.fromInt railHeight)
                , SA.viewBox ("0 0 " ++ String.fromInt svgWidth ++ " " ++ String.fromInt railHeight)
                , SA.style "display:block"
                ]
                (railDefs
                    :: List.concat (List.indexedMap (renderRailNode selectedNodeId) visibleNodes)
                    ++ List.concat (List.indexedMap (\i _ -> renderArrow (List.length visibleNodes) i) visibleNodes)
                )
        ]


railDefs : Svg Msg
railDefs =
    Svg.defs []
        [ Svg.filter [ SA.id "fv-glow" ]
            [ Svg.feGaussianBlur [ SA.stdDeviation "4", SA.result "blur" ] []
            , Svg.feMerge []
                [ Svg.feMergeNode [ SA.in_ "blur" ] []
                , Svg.feMergeNode [ SA.in_ "SourceGraphic" ] []
                ]
            ]
        , Svg.marker
            [ SA.id "arrowhead"
            , SA.markerWidth "8"
            , SA.markerHeight "8"
            , SA.refX "6"
            , SA.refY "3"
            , SA.orient "auto"
            ]
            [ Svg.polygon
                [ SA.points "0 0, 8 3, 0 6"
                , SA.fill "#30363D"
                ]
                []
            ]
        ]


renderRailNode : Maybe String -> Int -> AuthEvent -> List (Svg Msg)
renderRailNode selectedNodeId index event =
    let
        cx_ =
            index * nodeSpacing + 40

        cy_ =
            44

        status =
            nodeStatusFromEvent event

        color =
            Helpers.nodeColor status

        isSelected =
            selectedNodeId == Just event.id

        label =
            nodeDisplayLabel event

        statusLabel =
            Helpers.nodeStatusLabel status

        glowRing =
            if isSelected then
                [ Svg.circle
                    [ SA.cx (String.fromInt cx_)
                    , SA.cy (String.fromInt cy_)
                    , SA.r (String.fromInt (nodeRadius + 6))
                    , SA.fill "none"
                    , SA.stroke color
                    , SA.strokeWidth "2"
                    , SA.strokeOpacity "0.5"
                    , SA.filter "url(#fv-glow)"
                    ]
                    []
                ]

            else
                []

        nodeBg =
            Svg.circle
                [ SA.cx (String.fromInt cx_)
                , SA.cy (String.fromInt cy_)
                , SA.r (String.fromInt nodeRadius)
                , SA.fill color
                ]
                []

        nameLabel =
            Svg.text_
                [ SA.x (String.fromInt cx_)
                , SA.y (String.fromInt (cy_ + nodeRadius + 14))
                , SA.textAnchor "middle"
                , SA.fontSize "10"
                , SA.fill "#8B949E"
                , SA.fontFamily "'Segoe UI', system-ui, sans-serif"
                ]
                [ Svg.text (truncate_ 14 label) ]

        statusText =
            Svg.text_
                [ SA.x (String.fromInt cx_)
                , SA.y (String.fromInt (cy_ + nodeRadius + 26))
                , SA.textAnchor "middle"
                , SA.fontSize "10"
                , SA.fill color
                , SA.fontFamily "'Segoe UI', system-ui, sans-serif"
                ]
                [ Svg.text statusLabel ]
    in
    glowRing
        ++ [ Svg.g
                [ Svg.Events.onClick (SelectFlowNode event.id)
                , SA.style "cursor:pointer"
                ]
                [ nodeBg, nameLabel, statusText ]
           ]


renderArrow : Int -> Int -> List (Svg Msg)
renderArrow total index =
    if index >= total - 1 then
        []

    else
        let
            x1_ =
                index * nodeSpacing + 40 + nodeRadius + 16

            x2_ =
                (index + 1) * nodeSpacing + 40 - nodeRadius - 16

            y_ =
                44
        in
        [ Svg.line
            [ SA.x1 (String.fromInt x1_)
            , SA.y1 (String.fromInt y_)
            , SA.x2 (String.fromInt x2_)
            , SA.y2 (String.fromInt y_)
            , SA.stroke "#30363D"
            , SA.strokeWidth "1.5"
            , SA.markerEnd "url(#arrowhead)"
            ]
            []
        ]


truncate_ : Int -> String -> String
truncate_ maxLen s =
    if String.length s <= maxLen then
        s

    else
        String.left maxLen s ++ "…"


-- ── Detail card ───────────────────────────────────────────────────────────────


viewDetail : List AuthEvent -> Maybe String -> Set String -> Html Msg
viewDetail events selectedNodeId expandedSubRows =
    case selectedNodeId of
        Nothing ->
            Html.div [ Html.Attributes.class "fv-detail fv-detail-empty" ]
                [ Html.text "Select a node to see its details." ]

        Just nodeId ->
            let
                maybeNode =
                    List.head (List.filter (\e -> e.id == nodeId) events)

                netEvents =
                    List.filter (\e -> e.causedBy == Just nodeId) events
                        |> List.sortBy .timestamp
            in
            Html.div [ Html.Attributes.class "fv-detail" ]
                (viewNodeData maybeNode expandedSubRows
                    ++ viewNetworkSection nodeId netEvents expandedSubRows
                )


viewKvRow : String -> String -> Html Msg
viewKvRow key val =
    Html.div [ Html.Attributes.class "fv-kv-row" ]
        [ Html.span [ Html.Attributes.class "fv-kv-key" ] [ Html.text key ]
        , Html.span [ Html.Attributes.class "fv-kv-val" ] [ Html.text val ]
        , Html.button
            [ Html.Attributes.class "fv-copy-btn"
            , Html.Events.onClick (CopyToClipboard val)
            ]
            [ Html.text "⎘" ]
        ]


viewNodeData : Maybe AuthEvent -> Set String -> List (Html Msg)
viewNodeData maybeNode expandedSubRows =
    case maybeNode of
        Nothing ->
            []

        Just node ->
            case node.data of
                Journey journey ->
                    viewJourneyNodeData node.id journey expandedSubRows

                Oidc oidc ->
                    viewOidcNodeData oidc

                DaVinciNode dvNode ->
                    viewDaVinciNodeData node.id dvNode expandedSubRows

                _ ->
                    []


viewDaVinciNodeData : String -> NodeData -> Set String -> List (Html Msg)
viewDaVinciNodeData nodeId node expandedSubRows =
    let
        hasResponse =
            node.responseBody /= Nothing

        collectorCount =
            Maybe.withDefault 0 (Maybe.map List.length node.collectors)

        hasCollectors =
            collectorCount > 0

        responseKey =
            nodeId ++ ":node-response"

        collectorsKey =
            nodeId ++ ":node-collectors"
    in
    if not hasResponse && not hasCollectors then
        []

    else
        [ Html.div [ Html.Attributes.class "fv-net-group" ]
            [ Html.div [ Html.Attributes.class "fv-net-group-header" ]
                [ Html.span [ Html.Attributes.class "fv-node-label" ]
                    [ Html.text (Maybe.withDefault "Node Response" node.nodeName) ]
                ]
            , if hasResponse then
                viewSection responseKey "Response" expandedSubRows
                    [ case node.responseBody of
                        Just body -> JsonTree.view "Response" body
                        Nothing   -> Html.text ""
                    ]

              else
                Html.text ""
            , if hasCollectors then
                viewSection collectorsKey ("Collectors (" ++ String.fromInt collectorCount ++ ")") expandedSubRows
                    (case node.collectors of
                        Nothing -> []
                        Just cs ->
                            Html.div [ Html.Attributes.class "coll-copy-all-row" ]
                                [ Html.button
                                    [ Html.Attributes.class "fv-copy-btn coll-copy-all"
                                    , Html.Events.onClick (CopyToClipboard (Encode.encode 4 (Encode.list identity cs)))
                                    ]
                                    [ Html.text "Copy all" ]
                                ]
                                :: List.indexedMap
                                    (\i c ->
                                        Html.div [ Html.Attributes.class "coll-card" ]
                                            [ Html.div [ Html.Attributes.class "coll-card-header" ]
                                                [ Html.span [] [ Html.text ("Collector " ++ String.fromInt (i + 1)) ]
                                                , Html.button
                                                    [ Html.Attributes.class "fv-copy-btn"
                                                    , Html.Events.onClick (CopyToClipboard (Encode.encode 4 c))
                                                    ]
                                                    [ Html.text "\u{2398}" ]
                                                ]
                                            , JsonTree.view ("Collector " ++ String.fromInt (i + 1)) c
                                            ]
                                    )
                                    cs
                    )

              else
                Html.text ""
            ]
        ]


viewJourneyNodeData : String -> JourneyData -> Set String -> List (Html Msg)
viewJourneyNodeData nodeId journey expandedSubRows =
    let
        stepType =
            Maybe.withDefault "Step" journey.stepType

        callbacks =
            Maybe.withDefault [] journey.callbacks

        cbCount =
            List.length callbacks

        hasCallbacks =
            cbCount > 0

        isFailure =
            stepType == "LoginFailure"

        isSuccess =
            stepType == "LoginSuccess"

        callbacksKey =
            nodeId ++ ":journey-callbacks"

        sessionKey =
            nodeId ++ ":journey-session"

        title =
            case journey.header of
                Just h -> h
                Nothing ->
                    case journey.stage of
                        Just s -> s
                        Nothing -> stepType
    in
    [ Html.div [ Html.Attributes.class "fv-net-group" ]
        ([ Html.div [ Html.Attributes.class "fv-net-group-header" ]
            [ Html.span [ Html.Attributes.class "fv-node-label" ] [ Html.text title ]
            , Html.span
                [ Html.Attributes.class
                    ("fv-net-status "
                        ++ (if isFailure then "st-err" else if isSuccess then "st-ok" else "st-nil")
                    )
                ]
                [ Html.text stepType ]
            ]
         ]
            ++ (if isFailure then
                    [ Html.div [ Html.Attributes.class "fv-journey-error" ]
                        [ case journey.errorMessage of
                            Just msg -> Html.p [] [ Html.text msg ]
                            Nothing  -> Html.text ""
                        , case journey.errorReason of
                            Just reason -> Html.p [ Html.Attributes.class "fv-journey-reason" ] [ Html.text ("Reason: " ++ reason) ]
                            Nothing     -> Html.text ""
                        ]
                    ]

                else if isSuccess then
                    [ viewSection sessionKey "Session" expandedSubRows
                        [ Html.div [ Html.Attributes.class "fv-kv-list" ]
                            (List.filterMap identity
                                [ Maybe.map (viewKvRow "tokenId") journey.tokenId
                                , Maybe.map (viewKvRow "successUrl") journey.successUrl
                                ]
                            )
                        ]
                    ]

                else
                    []
               )
            ++ (if hasCallbacks then
                    [ viewSection callbacksKey ("Callbacks (" ++ String.fromInt cbCount ++ ")") expandedSubRows
                        (List.indexedMap
                            (\i cb ->
                                Html.div [ Html.Attributes.class "coll-card" ]
                                    [ JsonTree.view ("Callback " ++ String.fromInt (i + 1)) cb ]
                            )
                            callbacks
                        )
                    ]

                else
                    []
               )
        )
    ]


viewOidcNodeData : OidcData -> List (Html Msg)
viewOidcNodeData oidc =
    let
        phase =
            Maybe.withDefault "—" oidc.phase

        status =
            Maybe.withDefault "—" oidc.status

        isError =
            status == "error"
    in
    [ Html.div [ Html.Attributes.class "fv-net-group" ]
        [ Html.div [ Html.Attributes.class "fv-net-group-header" ]
            [ Html.span [ Html.Attributes.class "fv-node-label" ] [ Html.text phase ]
            , Html.span
                [ Html.Attributes.class ("fv-net-status " ++ (if isError then "st-err" else "st-ok")) ]
                [ Html.text status ]
            ]
        , Html.div [ Html.Attributes.class "fv-kv-list" ]
            (List.filterMap identity
                [ Maybe.map (viewKvRow "clientId") oidc.clientId
                , if isError then Maybe.map (viewKvRow "errorCode") oidc.errorCode else Nothing
                , if isError then Maybe.map (viewKvRow "errorMessage") oidc.errorMessage else Nothing
                ]
            )
        ]
    ]


viewNetworkSection : String -> List AuthEvent -> Set String -> List (Html Msg)
viewNetworkSection _ netEvents expandedSubRows =
    if List.isEmpty netEvents then
        []

    else
        List.map (\e -> viewNetGroup e expandedSubRows) netEvents


viewNetGroup : AuthEvent -> Set String -> Html Msg
viewNetGroup event expandedSubRows =
    case event.data of
        Network net ->
            let
                statusText =
                    Maybe.withDefault "—" (Maybe.map String.fromInt net.status)

                durationText =
                    case net.duration of
                        Nothing  -> ""
                        Just ms  ->
                            if ms < 1 then "<1ms"
                            else String.fromInt (round ms) ++ "ms"

                urlText =
                    Maybe.withDefault "—" net.url

                hasResponse =
                    net.responseBody /= Nothing

                hasRequest =
                    net.requestBody /= Nothing

                hasAny =
                    hasResponse || hasRequest

                responseKey =
                    event.id ++ ":response"

                requestKey =
                    event.id ++ ":request"
            in
            Html.div [ Html.Attributes.class "fv-net-group" ]
                [ Html.div [ Html.Attributes.class "fv-net-group-header" ]
                    [ Html.span [ Html.Attributes.class ("tl-meth " ++ Helpers.methodClass net.method) ]
                        [ Html.text (Maybe.withDefault "—" net.method) ]
                    , Html.span [ Html.Attributes.class "fv-net-url" ] [ Html.text urlText ]
                    , Html.span [ Html.Attributes.class ("fv-net-status " ++ Helpers.statusClass net.status) ]
                        [ Html.text statusText ]
                    , Html.span [ Html.Attributes.class "fv-net-dur" ] [ Html.text durationText ]
                    ]
                , if not hasAny then
                    Html.div [ Html.Attributes.class "fv-no-data" ] [ Html.text "No data captured for this request." ]

                  else
                    Html.text ""
                , if hasResponse then
                    viewSection responseKey "Response" expandedSubRows
                        [ case net.responseBody of
                            Just body -> JsonTree.view "Response" body
                            Nothing   -> Html.text ""
                        ]

                  else
                    Html.text ""
                , if hasRequest then
                    viewSection requestKey "Request" expandedSubRows
                        [ case net.requestBody of
                            Just body -> JsonTree.view "Request" body
                            Nothing   -> Html.text ""
                        ]

                  else
                    Html.text ""
                ]

        _ ->
            Html.text ""


viewSection : String -> String -> Set String -> List (Html Msg) -> Html Msg
viewSection key label expandedSubRows content =
    let
        isOpen =
            Set.member key expandedSubRows

        icon =
            if isOpen then "▼ " else "▶ "
    in
    Html.div []
        [ Html.div
            [ Html.Attributes.class "fv-section-row"
            , Html.Events.onClick (ToggleSubRow key)
            ]
            [ Html.text (icon ++ label) ]
        , if isOpen then
            Html.div [ Html.Attributes.class "fv-section-body" ] content

          else
            Html.text ""
        ]


-- ── Main view ─────────────────────────────────────────────────────────────────


view : List AuthEvent -> Maybe Int -> Maybe String -> Set String -> Html Msg
view events playbackIndex selectedNodeId expandedSubRows =
    Html.div [ Html.Attributes.class "fv-view" ]
        [ viewRail events playbackIndex selectedNodeId
        , viewDetail events selectedNodeId expandedSubRows
        ]


-- ── Playback controls ─────────────────────────────────────────────────────────


viewPlaybackControls : List AuthEvent -> Maybe Int -> Bool -> Html Msg
viewPlaybackControls events playbackIndex isPlaying =
    let
        sdkNodes =
            Helpers.sdkNodes events

        total =
            List.length sdkNodes

        stepLabel =
            case playbackIndex of
                Just n  -> "Step " ++ String.fromInt (n + 1) ++ " / " ++ String.fromInt total
                Nothing -> ""
    in
    Html.div [ Html.Attributes.class "fv-playback-controls" ]
        [ Html.button [ Html.Events.onClick ResetPlayback, Html.Attributes.class "tb-btn" ] [ Html.text "◀◀" ]
        , if isPlaying then
            Html.button [ Html.Events.onClick StopPlayback, Html.Attributes.class "tb-btn" ] [ Html.text "⏸ Pause" ]

          else
            Html.button
                [ Html.Events.onClick StartPlayback
                , Html.Attributes.class "tb-btn"
                , Html.Attributes.disabled (List.isEmpty sdkNodes)
                ]
                [ Html.text
                    (if playbackIndex == Nothing then "▶ Play" else "▶ Resume")
                ]
        , if stepLabel /= "" then
            Html.span [ Html.Attributes.class "fv-step-label" ] [ Html.text stepLabel ]

          else
            Html.text ""
        ]
