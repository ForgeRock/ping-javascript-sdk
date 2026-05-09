module LearnView exposing (view)

import Helpers
import Html exposing (Html)
import Html.Attributes exposing (..)
import Json.Decode as JD
import Svg exposing (..)
import Svg.Attributes as SA
import Svg.Events
import Types exposing (AuthEvent, CanvasState, CardId(..), EventData(..), NetworkData, NodeData, SdkError)
import Update exposing (Msg(..))


view : List AuthEvent -> CanvasState -> Html Msg
view events canvas =
    let
        sdkNodes =
            Helpers.sdkNodes events
    in
    Html.div [ class "lv-view" ]
        [ viewRail sdkNodes canvas.learnSelectedNodeId
        , viewCanvas events canvas
        ]



-- ── Rail ─────────────────────────────────────────────────────────────────────


nodeSpacing : Int
nodeSpacing =
    140


nodeRadius : Int
nodeRadius =
    18


railHeight : Int
railHeight =
    110


viewRail : List AuthEvent -> Maybe String -> Html Msg
viewRail sdkNodes selectedNodeId =
    let
        count =
            List.length sdkNodes

        svgWidth =
            if count == 0 then
                200

            else
                count * nodeSpacing + 60
    in
    Html.div [ class "lv-rail" ]
        [ if List.isEmpty sdkNodes then
            Html.div [ class "lv-rail-empty" ] [ Html.text "No SDK nodes recorded yet." ]

          else
            Svg.svg
                [ SA.width (String.fromInt svgWidth)
                , SA.height (String.fromInt railHeight)
                , SA.viewBox ("0 0 " ++ String.fromInt svgWidth ++ " " ++ String.fromInt railHeight)
                , SA.style "display:block"
                ]
                (railDefs
                    :: List.concat (List.indexedMap (renderRailNode selectedNodeId) sdkNodes)
                    ++ List.concat (List.indexedMap (\i _ -> renderRailArrow (List.length sdkNodes) i) sdkNodes)
                )
        ]


railDefs : Svg Msg
railDefs =
    Svg.defs []
        [ Svg.filter [ SA.id "lv-glow" ]
            [ Svg.feGaussianBlur [ SA.stdDeviation "4", SA.result "blur" ] []
            , Svg.feMerge []
                [ Svg.feMergeNode [ SA.in_ "blur" ] []
                , Svg.feMergeNode [ SA.in_ "SourceGraphic" ] []
                ]
            ]
        , Svg.marker
            [ SA.id "lv-arrowhead"
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

        color =
            nodeColor event

        isSelected =
            selectedNodeId == Just event.id

        label =
            nodeLabel event

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
                    , SA.filter "url(#lv-glow)"
                    ]
                    []
                ]

            else
                []
    in
    glowRing
        ++ [ Svg.g
                [ Svg.Events.onClick (LearnSelectNode event.id)
                , SA.style "cursor:pointer"
                ]
                [ Svg.circle
                    [ SA.cx (String.fromInt cx_)
                    , SA.cy (String.fromInt cy_)
                    , SA.r (String.fromInt nodeRadius)
                    , SA.fill color
                    ]
                    []
                , Svg.text_
                    [ SA.x (String.fromInt cx_)
                    , SA.y (String.fromInt (cy_ + nodeRadius + 14))
                    , SA.textAnchor "middle"
                    , SA.fontSize "10"
                    , SA.fill "#8B949E"
                    , SA.fontFamily "'Segoe UI', system-ui, sans-serif"
                    ]
                    [ Svg.text (truncate_ 14 label) ]
                ]
           ]


renderRailArrow : Int -> Int -> List (Svg Msg)
renderRailArrow total index =
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
            , SA.markerEnd "url(#lv-arrowhead)"
            ]
            []
        ]



-- ── Canvas ───────────────────────────────────────────────────────────────────


viewCanvas : List AuthEvent -> CanvasState -> Html Msg
viewCanvas events canvas =
    case canvas.learnSelectedNodeId of
        Nothing ->
            Html.div [ class "lv-canvas lv-canvas-empty" ]
                [ Html.text "Select a node above to see its request lifecycle." ]

        Just nodeId ->
            let
                maybeNode =
                    Helpers.findEventInList nodeId events

                -- Primary: direct causedBy link
                directNetEvents =
                    List.filter (\e -> e.causedBy == Just nodeId) events
                        |> List.sortBy .timestamp

                -- Fallback: network events in the time window between this
                -- node and the next node (when causedBy is missing)
                netEvents =
                    if not (List.isEmpty directNetEvents) then
                        directNetEvents

                    else
                        inferNetworkEvents nodeId events

                requestEvent =
                    List.head netEvents

                responseEvent =
                    List.head (List.reverse netEvents)

                -- Error attribution: where did the error originate?
                sdkNodeError =
                    case maybeNode of
                        Just n ->
                            case n.data of
                                DaVinciNode nd ->
                                    nd.sdkError

                                _ ->
                                    Nothing

                        Nothing ->
                            Nothing

                sdkNodeStatus =
                    case maybeNode of
                        Just n ->
                            case n.data of
                                DaVinciNode nd ->
                                    nd.nodeStatus

                                _ ->
                                    Nothing

                        Nothing ->
                            Nothing

                serverHasError =
                    case responseEvent of
                        Just re ->
                            case re.data of
                                Network nd ->
                                    case nd.status of
                                        Just s ->
                                            s >= 400

                                        Nothing ->
                                            False

                                _ ->
                                    False

                        Nothing ->
                            False

                sdkHasError =
                    sdkNodeError /= Nothing
                        || sdkNodeStatus == Just Types.StatusError
                        || sdkNodeStatus == Just Types.Failure

                corsError =
                    case maybeNode of
                        Just n ->
                            n.isCors

                        Nothing ->
                            False

                anyError =
                    serverHasError || sdkHasError || corsError

                hasCollectors =
                    case maybeNode of
                        Just n ->
                            case n.data of
                                DaVinciNode nd ->
                                    nd.collectors /= Nothing && nd.collectors /= Just []

                                _ ->
                                    False

                        Nothing ->
                            False

                requestMethod =
                    case requestEvent of
                        Just re ->
                            case re.data of
                                Network nd ->
                                    Maybe.withDefault "POST" nd.method

                                _ ->
                                    "POST"

                        Nothing ->
                            "POST"

                responseStatusCode =
                    case responseEvent of
                        Just re ->
                            case re.data of
                                Network nd ->
                                    nd.status

                                _ ->
                                    Nothing

                        Nothing ->
                            Nothing

                responseStatus =
                    Maybe.map String.fromInt responseStatusCode
                        |> Maybe.withDefault "—"

                noNetEvents =
                    List.isEmpty netEvents

                transform =
                    "translate("
                        ++ String.fromFloat canvas.panX
                        ++ ","
                        ++ String.fromFloat canvas.panY
                        ++ ") scale("
                        ++ String.fromFloat canvas.zoom
                        ++ ")"
            in
            Html.div [ class "lv-canvas" ]
                [ Svg.svg
                    [ SA.class "lv-canvas-svg"
                    , SA.width "100%"
                    , SA.height "100%"
                    , Svg.Events.on "mousedown"
                        (JD.map2 LearnStartPan
                            (JD.field "clientX" JD.float)
                            (JD.field "clientY" JD.float)
                        )
                    , Svg.Events.on "mousemove"
                        (JD.map2 LearnDrag
                            (JD.field "clientX" JD.float)
                            (JD.field "clientY" JD.float)
                        )
                    , Svg.Events.on "mouseup" (JD.succeed LearnEndDrag)
                    , Svg.Events.on "mouseleave" (JD.succeed LearnEndDrag)
                    , Svg.Events.on "wheel"
                        (JD.map LearnZoom (JD.field "deltaY" JD.float))
                    ]
                    [ canvasDefs
                    , Svg.g [ SA.transform transform ]
                        (renderCards canvas serverHasError sdkHasError corsError hasCollectors noNetEvents requestMethod responseStatus maybeNode requestEvent responseEvent sdkNodeError)
                    ]
                ]


canvasDefs : Svg Msg
canvasDefs =
    Svg.defs []
        [ Svg.marker
            [ SA.id "lv-card-arrow"
            , SA.markerWidth "10"
            , SA.markerHeight "7"
            , SA.refX "9"
            , SA.refY "3.5"
            , SA.orient "auto"
            ]
            [ Svg.polygon
                [ SA.points "0 0, 10 3.5, 0 7"
                , SA.fill "#484F58"
                ]
                []
            ]
        ]


renderCards : CanvasState -> Bool -> Bool -> Bool -> Bool -> Bool -> String -> String -> Maybe AuthEvent -> Maybe AuthEvent -> Maybe AuthEvent -> Maybe SdkError -> List (Svg Msg)
renderCards canvas serverHasError sdkHasError corsError hasCollectors noNetEvents requestMethod responseStatus maybeNode requestEvent responseEvent sdkNodeError =
    let
        anyError =
            serverHasError || sdkHasError || corsError

        cardW =
            160

        cardH =
            120

        gap =
            80

        startX =
            50

        y =
            80

        browserX =
            startX

        serverX =
            startX + cardW + gap

        sdkX =
            startX + 2 * (cardW + gap)

        formX =
            startX + 3 * (cardW + gap)

        getOffset key =
            List.filter (\( k, _ ) -> k == key) canvas.cardPositions
                |> List.head
                |> Maybe.map Tuple.second
                |> Maybe.withDefault { x = 0, y = 0 }

        browserOff =
            getOffset "browser"

        serverOff =
            getOffset "server"

        sdkOff =
            getOffset "sdk"

        formOff =
            getOffset "form"

        bx =
            toFloat browserX + browserOff.x

        by =
            toFloat y + browserOff.y

        sx =
            toFloat serverX + serverOff.x

        sy =
            toFloat y + serverOff.y

        sdx =
            toFloat sdkX + sdkOff.x

        sdy =
            toFloat y + sdkOff.y

        fx =
            toFloat formX + formOff.x

        fy =
            toFloat y + formOff.y

        fW =
            toFloat cardW

        fH =
            toFloat cardH

        -- Card border colors: only the error SOURCE gets red,
        -- downstream cards show propagated red (dimmer)
        browserBorder =
            if corsError then
                "#F85149"

            else
                "#58A6FF"

        serverBorder =
            if serverHasError then
                "#F85149"

            else
                "#484F58"

        sdkBorder =
            if sdkHasError && not serverHasError then
                -- SDK is the error source (not just receiving a server error)
                "#F85149"

            else if serverHasError then
                -- SDK received an error from server (propagated, not source)
                "#b44a44"

            else
                "#3FB950"

        formBorder =
            if anyError then
                "#484F58"

            else if not hasCollectors then
                "#484F58"

            else
                "#A371F7"

        formOpacity =
            if hasCollectors && not anyError then
                "1"

            else
                "0.4"

        formDash =
            if hasCollectors && not anyError then
                ""

            else
                "4,4"

        -- Arrow colors
        requestArrowColor =
            if corsError then
                "#F85149"

            else
                "#58A6FF"

        responseArrowColor =
            if serverHasError then
                "#F85149"

            else
                "#3FB950"

        responseArrowLabel =
            if serverHasError then
                "✕ " ++ responseStatus

            else
                "← " ++ responseStatus

        sdkContextLine =
            if sdkHasError && not serverHasError then
                "Error in SDK"

            else if serverHasError then
                "Received error"

            else
                "Processes response"

        formContextLine =
            if anyError then
                "Skipped"

            else if hasCollectors then
                "Collects input"

            else
                "No collectors"

        -- Error pulse: which card is the source?
        pulseTarget =
            if corsError then
                Just ( bx, by )

            else if serverHasError then
                Just ( sx, sy )

            else if sdkHasError then
                Just ( sdx, sdy )

            else
                Nothing
    in
    [ -- Browser card
      renderCard BrowserCard bx by fW fH browserBorder "1" "" canvas.expandedCard
        (browserIcon (bx + 30) (by + 20))
        "BROWSER"
        (if corsError then "CORS blocked" else "Sends request")
    , expandedPanel BrowserCard bx (by + fH + 8) fW canvas.expandedCard
        (browserDetail requestEvent corsError)

    -- Arrow: Browser -> Server
    , renderArrowLine (bx + fW) (by + fH / 2) sx (sy + fH / 2) (requestMethod ++ " →") requestArrowColor False

    -- Server card
    , renderCard ServerCard sx sy fW fH serverBorder "1" "" canvas.expandedCard
        (serverIcon (sx + 40) (sy + 15))
        "SERVER"
        (if serverHasError then "✕ " ++ responseStatus else responseStatus ++ " OK")
    , expandedPanel ServerCard sx (sy + fH + 8) fW canvas.expandedCard
        (serverDetail responseEvent serverHasError)

    -- Arrow: Server -> SDK
    , renderArrowLine (sx + fW) (sy + fH / 2) sdx (sdy + fH / 2) responseArrowLabel responseArrowColor False

    -- SDK card
    , renderCard SdkCard sdx sdy fW fH sdkBorder "1" "" canvas.expandedCard
        (sdkIcon (sdx + 35) (sdy + 20))
        "SDK"
        sdkContextLine
    , expandedPanel SdkCard sdx (sdy + fH + 8) fW canvas.expandedCard
        (sdkDetail maybeNode sdkNodeError serverHasError)

    -- Arrow: SDK -> Form
    , renderArrowLine (sdx + fW) (sdy + fH / 2) fx (fy + fH / 2) "renders" "#484F58" True

    -- Form card
    , renderCard FormCard fx fy fW fH formBorder formOpacity formDash canvas.expandedCard
        (formIcon (fx + 35) (fy + 18))
        "FORM"
        formContextLine
    , expandedPanel FormCard fx (fy + fH + 8) fW canvas.expandedCard
        (formDetail maybeNode)
    ]
        -- Error pulse ring on the SOURCE card
        ++ (case pulseTarget of
                Just ( px, py ) ->
                    [ Svg.rect
                        [ SA.x (String.fromFloat (px - 6))
                        , SA.y (String.fromFloat (py - 6))
                        , SA.width (String.fromFloat (fW + 12))
                        , SA.height (String.fromFloat (fH + 12))
                        , SA.rx "12"
                        , SA.fill "none"
                        , SA.stroke "#F85149"
                        , SA.strokeWidth "2"
                        , SA.strokeOpacity "0.6"
                        , SA.class "lv-pulse"
                        ]
                        []
                    ]

                Nothing ->
                    []
           )
        ++ (if noNetEvents then
                [ Svg.text_
                    [ SA.x (String.fromFloat (bx + fW + toFloat gap / 2))
                    , SA.y (String.fromFloat (by + fH + 30))
                    , SA.textAnchor "middle"
                    , SA.fontSize "11"
                    , SA.fill "#484F58"
                    , SA.fontFamily "'Segoe UI', system-ui, sans-serif"
                    ]
                    [ Svg.text "No network events captured" ]
                ]

            else
                []
           )


cardDragDecoder : CardId -> JD.Decoder Msg
cardDragDecoder cardId =
    JD.map2 (LearnStartDrag cardId)
        (JD.field "clientX" JD.float)
        (JD.field "clientY" JD.float)


renderCard : CardId -> Float -> Float -> Float -> Float -> String -> String -> String -> Maybe CardId -> Svg Msg -> String -> String -> Svg Msg
renderCard cardId x y w h borderColor opacity dashArray expandedCard icon label contextLine =
    let
        isExpanded =
            expandedCard == Just cardId
    in
    Svg.g
        [ Svg.Events.on "mousedown" (cardDragDecoder cardId)
        , Svg.Events.onClick (LearnExpandCard cardId)
        , SA.style "cursor:grab"
        , SA.opacity opacity
        ]
        [ Svg.rect
            [ SA.x (String.fromFloat x)
            , SA.y (String.fromFloat y)
            , SA.width (String.fromFloat w)
            , SA.height (String.fromFloat h)
            , SA.rx "8"
            , SA.ry "8"
            , SA.fill "#161B22"
            , SA.stroke borderColor
            , SA.strokeWidth
                (if isExpanded then
                    "3"

                 else
                    "1.5"
                )
            , SA.strokeDasharray dashArray
            ]
            []
        , icon
        , Svg.text_
            [ SA.x (String.fromFloat (x + w / 2))
            , SA.y (String.fromFloat (y + h - 22))
            , SA.textAnchor "middle"
            , SA.fontSize "11"
            , SA.fontWeight "bold"
            , SA.fill "#E6EDF3"
            , SA.fontFamily "'Segoe UI', system-ui, sans-serif"
            ]
            [ Svg.text label ]
        , Svg.text_
            [ SA.x (String.fromFloat (x + w / 2))
            , SA.y (String.fromFloat (y + h - 8))
            , SA.textAnchor "middle"
            , SA.fontSize "9"
            , SA.fill "#8B949E"
            , SA.fontFamily "'Segoe UI', system-ui, sans-serif"
            ]
            [ Svg.text contextLine ]
        ]


renderArrowLine : Float -> Float -> Float -> Float -> String -> String -> Bool -> Svg Msg
renderArrowLine x1 y1 x2 y2 label color isDashed =
    let
        midX =
            (x1 + x2) / 2

        midY =
            (y1 + y2) / 2 - 10
    in
    Svg.g []
        [ Svg.line
            ([ SA.x1 (String.fromFloat x1)
             , SA.y1 (String.fromFloat y1)
             , SA.x2 (String.fromFloat x2)
             , SA.y2 (String.fromFloat y2)
             , SA.stroke color
             , SA.strokeWidth "1.5"
             , SA.markerEnd "url(#lv-card-arrow)"
             ]
                ++ (if isDashed then
                        [ SA.strokeDasharray "5 3" ]

                    else
                        []
                   )
            )
            []
        , Svg.text_
            [ SA.x (String.fromFloat midX)
            , SA.y (String.fromFloat midY)
            , SA.textAnchor "middle"
            , SA.fontSize "9"
            , SA.fill color
            , SA.fontFamily "'Segoe UI', system-ui, sans-serif"
            , SA.fontWeight "600"
            ]
            [ Svg.text label ]
        ]



-- ── Expanded Panels ─────────────────────────────────────────────────────────


expandedPanel : CardId -> Float -> Float -> Float -> Maybe CardId -> List (Html Msg) -> Svg Msg
expandedPanel cardId x y w expandedCard content =
    if expandedCard == Just cardId then
        Svg.foreignObject
            [ SA.x (String.fromFloat x)
            , SA.y (String.fromFloat y)
            , SA.width (String.fromFloat w)
            , SA.height "120"
            ]
            [ Html.div
                [ Html.Attributes.style "font-family" "'Segoe UI', system-ui, sans-serif"
                , Html.Attributes.style "font-size" "10px"
                , Html.Attributes.style "color" "#8b949e"
                , Html.Attributes.style "background" "#161B22"
                , Html.Attributes.style "border" "1px solid #30363d"
                , Html.Attributes.style "border-radius" "6px"
                , Html.Attributes.style "padding" "6px 8px"
                ]
                content
            ]

    else
        Svg.g [] []


detailRow : String -> String -> Html Msg
detailRow label value =
    detailRowColored label value "#e6edf3"


detailRowColored : String -> String -> String -> Html Msg
detailRowColored label value color =
    Html.div [ Html.Attributes.style "margin-bottom" "2px" ]
        [ Html.span [ Html.Attributes.style "color" "#484f58" ] [ Html.text (label ++ " ") ]
        , Html.span [ Html.Attributes.style "color" color, Html.Attributes.style "font-weight" "600" ] [ Html.text value ]
        ]


browserDetail : Maybe AuthEvent -> Bool -> List (Html Msg)
browserDetail requestEvent corsError =
    (if corsError then
        [ detailRowColored "CORS" "Request blocked by browser" "#F85149" ]

     else
        []
    )
        ++ (case requestEvent of
                Just re ->
                    case re.data of
                        Network nd ->
                            [ detailRow "Method" (Maybe.withDefault "POST" nd.method)
                            , detailRow "URL" (Maybe.withDefault "—" nd.url)
                            ]

                        _ ->
                            [ Html.text "No request data" ]

                Nothing ->
                    [ Html.text "No request captured" ]
           )


serverDetail : Maybe AuthEvent -> Bool -> List (Html Msg)
serverDetail responseEvent isError =
    case responseEvent of
        Just re ->
            case re.data of
                Network nd ->
                    let
                        statusStr =
                            Maybe.map String.fromInt nd.status
                                |> Maybe.withDefault "—"

                        statusColor =
                            if isError then
                                "#F85149"

                            else
                                "#3FB950"

                        durationStr =
                            case nd.duration of
                                Just d ->
                                    String.fromInt (round d) ++ "ms"

                                Nothing ->
                                    "—"

                        urlStr =
                            Maybe.withDefault "—" nd.url
                    in
                    [ detailRowColored "Status" statusStr statusColor
                    , detailRow "Duration" durationStr
                    , detailRow "URL" (truncateUrl urlStr)
                    ]

                _ ->
                    [ Html.text "No response data" ]

        Nothing ->
            [ Html.text "No response captured" ]


sdkDetail : Maybe AuthEvent -> Maybe Types.SdkError -> Bool -> List (Html Msg)
sdkDetail maybeNode sdkError serverErrored =
    let
        errorSection =
            case sdkError of
                Just err ->
                    [ detailRowColored "Error" err.code "#F85149"
                    , detailRow "Message" err.message
                    , detailRow "Type" err.errorType
                    ]

                Nothing ->
                    if serverErrored then
                        [ detailRowColored "Note" "Server returned an error" "#d29922" ]

                    else
                        []
    in
    case maybeNode of
        Just n ->
            case n.data of
                DaVinciNode nd ->
                    let
                        statusLabel =
                            Maybe.map Helpers.nodeStatusLabel nd.nodeStatus
                                |> Maybe.withDefault "—"

                        statusColor =
                            case nd.nodeStatus of
                                Just Types.StatusError ->
                                    "#F85149"

                                Just Types.Failure ->
                                    "#F85149"

                                Just Types.Success ->
                                    "#3FB950"

                                Just Types.Continue ->
                                    "#58A6FF"

                                _ ->
                                    "#8b949e"

                        transitionStr =
                            case nd.previousStatus of
                                Just prev ->
                                    Helpers.nodeStatusLabel prev ++ " → " ++ statusLabel

                                Nothing ->
                                    statusLabel
                    in
                    [ detailRowColored "Status" transitionStr statusColor ]
                        ++ (case nd.nodeName of
                                Just name ->
                                    [ detailRow "Node" name ]

                                Nothing ->
                                    []
                           )
                        ++ (case nd.interactionId of
                                Just iid ->
                                    [ detailRow "Interaction" (truncate_ 14 iid) ]

                                Nothing ->
                                    []
                           )
                        ++ errorSection

                _ ->
                    [ Html.text "Not a DaVinci node" ]

        Nothing ->
            [ Html.text "No node selected" ]


formDetail : Maybe AuthEvent -> List (Html Msg)
formDetail maybeNode =
    case maybeNode of
        Just n ->
            case n.data of
                DaVinciNode nd ->
                    case nd.collectors of
                        Just collectors ->
                            if List.isEmpty collectors then
                                [ Html.text "No collectors" ]

                            else
                                [ detailRow "Collectors" (String.fromInt (List.length collectors)) ]

                        Nothing ->
                            [ Html.text "No collectors" ]

                _ ->
                    [ Html.text "No form data" ]

        Nothing ->
            [ Html.text "No node selected" ]



-- ── Icons ────────────────────────────────────────────────────────────────────


browserIcon : Float -> Float -> Svg Msg
browserIcon x y =
    Svg.g []
        [ -- Window frame
          Svg.rect
            [ SA.x (String.fromFloat x)
            , SA.y (String.fromFloat y)
            , SA.width "100"
            , SA.height "60"
            , SA.rx "4"
            , SA.fill "none"
            , SA.stroke "#58A6FF"
            , SA.strokeWidth "1.5"
            ]
            []

        -- Title bar
        , Svg.line
            [ SA.x1 (String.fromFloat x)
            , SA.y1 (String.fromFloat (y + 14))
            , SA.x2 (String.fromFloat (x + 100))
            , SA.y2 (String.fromFloat (y + 14))
            , SA.stroke "#58A6FF"
            , SA.strokeWidth "1"
            ]
            []

        -- Traffic lights
        , Svg.circle [ SA.cx (String.fromFloat (x + 8)), SA.cy (String.fromFloat (y + 7)), SA.r "2.5", SA.fill "#F85149" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 16)), SA.cy (String.fromFloat (y + 7)), SA.r "2.5", SA.fill "#D29922" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 24)), SA.cy (String.fromFloat (y + 7)), SA.r "2.5", SA.fill "#3FB950" ] []

        -- Globe in content area
        , Svg.circle [ SA.cx (String.fromFloat (x + 50)), SA.cy (String.fromFloat (y + 38)), SA.r "12", SA.fill "none", SA.stroke "#58A6FF", SA.strokeWidth "1" ] []
        , Svg.ellipse [ SA.cx (String.fromFloat (x + 50)), SA.cy (String.fromFloat (y + 38)), SA.rx "5", SA.ry "12", SA.fill "none", SA.stroke "#58A6FF", SA.strokeWidth "0.7" ] []
        , Svg.line [ SA.x1 (String.fromFloat (x + 38)), SA.y1 (String.fromFloat (y + 38)), SA.x2 (String.fromFloat (x + 62)), SA.y2 (String.fromFloat (y + 38)), SA.stroke "#58A6FF", SA.strokeWidth "0.7" ] []
        ]


serverIcon : Float -> Float -> Svg Msg
serverIcon x y =
    Svg.g []
        [ -- Cloud shape (simplified)
          Svg.ellipse
            [ SA.cx (String.fromFloat (x + 40))
            , SA.cy (String.fromFloat (y + 30))
            , SA.rx "38"
            , SA.ry "22"
            , SA.fill "none"
            , SA.stroke "#484F58"
            , SA.strokeWidth "1.5"
            ]
            []

        -- LED dots
        , Svg.circle [ SA.cx (String.fromFloat (x + 28)), SA.cy (String.fromFloat (y + 30)), SA.r "3", SA.fill "#3FB950" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 40)), SA.cy (String.fromFloat (y + 30)), SA.r "3", SA.fill "#3FB950" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 52)), SA.cy (String.fromFloat (y + 30)), SA.r "3", SA.fill "#58A6FF" ] []
        ]


sdkIcon : Float -> Float -> Svg Msg
sdkIcon x y =
    Svg.g []
        [ -- Window frame
          Svg.rect
            [ SA.x (String.fromFloat x)
            , SA.y (String.fromFloat y)
            , SA.width "90"
            , SA.height "55"
            , SA.rx "4"
            , SA.fill "none"
            , SA.stroke "#3FB950"
            , SA.strokeWidth "1.5"
            ]
            []

        -- Gear icon
        , Svg.circle [ SA.cx (String.fromFloat (x + 45)), SA.cy (String.fromFloat (y + 30)), SA.r "10", SA.fill "none", SA.stroke "#3FB950", SA.strokeWidth "1.5" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 45)), SA.cy (String.fromFloat (y + 30)), SA.r "4", SA.fill "#3FB950" ] []
        ]


formIcon : Float -> Float -> Svg Msg
formIcon x y =
    Svg.g []
        [ -- Form outline
          Svg.rect
            [ SA.x (String.fromFloat x)
            , SA.y (String.fromFloat y)
            , SA.width "90"
            , SA.height "60"
            , SA.rx "4"
            , SA.fill "none"
            , SA.stroke "#A371F7"
            , SA.strokeWidth "1.5"
            ]
            []

        -- Input field 1
        , Svg.rect [ SA.x (String.fromFloat (x + 10)), SA.y (String.fromFloat (y + 10)), SA.width "70", SA.height "12", SA.rx "2", SA.fill "none", SA.stroke "#484F58", SA.strokeWidth "1" ] []

        -- Input field 2
        , Svg.rect [ SA.x (String.fromFloat (x + 10)), SA.y (String.fromFloat (y + 28)), SA.width "70", SA.height "12", SA.rx "2", SA.fill "none", SA.stroke "#484F58", SA.strokeWidth "1" ] []

        -- Submit button
        , Svg.rect [ SA.x (String.fromFloat (x + 25)), SA.y (String.fromFloat (y + 46)), SA.width "40", SA.height "10", SA.rx "2", SA.fill "#A371F7", SA.fillOpacity "0.3", SA.stroke "#A371F7", SA.strokeWidth "1" ] []
        ]



-- ── Event correlation ────────────────────────────────────────────────────────


{-| When no network events have a direct `causedBy` link to this node,
infer them by time window: find all network events whose timestamp falls
between this node's timestamp and the next SDK node's timestamp.
-}
inferNetworkEvents : String -> List AuthEvent -> List AuthEvent
inferNetworkEvents nodeId events =
    let
        sdkNodes =
            Helpers.sdkNodes events

        nodeTimestamp =
            sdkNodes
                |> List.filter (\e -> e.id == nodeId)
                |> List.head
                |> Maybe.map .timestamp

        nextNodeTimestamp =
            case nodeTimestamp of
                Nothing ->
                    Nothing

                Just ts ->
                    sdkNodes
                        |> List.filter (\e -> e.timestamp > ts)
                        |> List.head
                        |> Maybe.map .timestamp

        isNetworkEvent e =
            case e.data of
                Network _ ->
                    True

                _ ->
                    False
    in
    case nodeTimestamp of
        Nothing ->
            []

        Just startTs ->
            events
                |> List.filter isNetworkEvent
                |> List.filter
                    (\e ->
                        e.timestamp
                            >= startTs
                            && (case nextNodeTimestamp of
                                    Just endTs ->
                                        e.timestamp < endTs

                                    Nothing ->
                                        True
                               )
                    )
                |> List.sortBy .timestamp


-- ── Helpers ──────────────────────────────────────────────────────────────────


nodeColor : AuthEvent -> String
nodeColor event =
    case event.data of
        DaVinciNode node ->
            Helpers.nodeColor (Maybe.withDefault Types.UnknownStatus node.nodeStatus)

        _ ->
            "#484F58"


nodeLabel : AuthEvent -> String
nodeLabel event =
    case event.data of
        DaVinciNode node ->
            node.nodeName
                |> orMaybe node.eventName
                |> Maybe.withDefault "—"

        Journey journey ->
            journey.stage
                |> orMaybe journey.header
                |> orMaybe journey.stepType
                |> Maybe.withDefault "—"

        Oidc oidc ->
            Maybe.withDefault "oidc" oidc.phase

        _ ->
            "—"


orMaybe : Maybe a -> Maybe a -> Maybe a
orMaybe fallback primary =
    case primary of
        Just _ ->
            primary

        Nothing ->
            fallback


truncate_ : Int -> String -> String
truncate_ maxLen s =
    if String.length s <= maxLen then
        s

    else
        String.left maxLen s ++ "…"


truncateUrl : String -> String
truncateUrl url =
    let
        stripped =
            url
                |> String.replace "https://" ""
                |> String.replace "http://" ""
    in
    if String.length stripped > 28 then
        String.left 28 stripped ++ "…"

    else
        stripped
