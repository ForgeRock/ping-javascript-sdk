module LearnView exposing (view)

import Helpers
import Html exposing (Html)
import Html.Attributes exposing (..)
import Json.Decode as JD
import Svg exposing (..)
import Svg.Attributes as SA
import Svg.Events
import Types exposing (AuthEvent, CanvasState, CardId(..), EventData(..), JourneyData, LearnLayout(..), NetworkData, NodeData, OidcSemanticData, SdkError)
import Update exposing (Msg(..))


view : List AuthEvent -> CanvasState -> Html Msg
view events canvas =
    let
        layout =
            detectLayout events

        nodes =
            Helpers.learnNodes events
    in
    Html.div [ class "lv-view" ]
        [ viewRail nodes canvas.learnSelectedNodeId layout
        , viewCanvas events canvas layout
        ]


detectLayout : List AuthEvent -> LearnLayout
detectLayout events =
    let
        hasDaVinci =
            List.any Helpers.isDaVinciNode events

        hasJourney =
            List.any Helpers.isJourneyNode events

        hasSdkOidc =
            List.any Helpers.isSdkOidcNode events

        oidcEvents =
            List.filter Helpers.hasOidcSemantics events

        hasPar =
            List.any (\e -> Maybe.andThen .oidcPhase e.oidcSemantics == Just "par") oidcEvents

        hasDpop =
            List.any (\e -> Maybe.withDefault False (Maybe.map .hasDpop e.oidcSemantics)) oidcEvents
    in
    if hasDaVinci then
        DaVinciLayout

    else if hasJourney then
        JourneyLayout

    else if hasPar then
        OidcParLayout

    else if hasDpop then
        OidcDpopLayout

    else if hasSdkOidc || not (List.isEmpty oidcEvents) then
        OidcCodeLayout

    else
        DaVinciLayout



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


viewRail : List AuthEvent -> Maybe String -> LearnLayout -> Html Msg
viewRail nodes selectedNodeId layout =
    let
        count =
            List.length nodes

        svgWidth =
            if count == 0 then
                200

            else
                count * nodeSpacing + 60

        emptyMessage =
            case layout of
                DaVinciLayout ->
                    "No DaVinci nodes recorded yet."

                JourneyLayout ->
                    "No Journey steps recorded yet."

                _ ->
                    "No OIDC events detected yet."
    in
    Html.div [ class "lv-rail" ]
        [ if List.isEmpty nodes then
            Html.div [ class "lv-rail-empty" ] [ Html.text emptyMessage ]

          else
            Svg.svg
                [ SA.width (String.fromInt svgWidth)
                , SA.height (String.fromInt railHeight)
                , SA.viewBox ("0 0 " ++ String.fromInt svgWidth ++ " " ++ String.fromInt railHeight)
                , SA.style "display:block"
                ]
                (railDefs
                    :: List.concat (List.indexedMap (renderRailNode selectedNodeId layout) nodes)
                    ++ List.concat (List.indexedMap (\i _ -> renderRailArrow (List.length nodes) i) nodes)
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


renderRailNode : Maybe String -> LearnLayout -> Int -> AuthEvent -> List (Svg Msg)
renderRailNode selectedNodeId layout index event =
    let
        cx_ =
            index * nodeSpacing + 40

        cy_ =
            44

        color =
            nodeColor event layout

        isSelected =
            selectedNodeId == Just event.id

        label =
            nodeLabel event layout

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


viewCanvas : List AuthEvent -> CanvasState -> LearnLayout -> Html Msg
viewCanvas events canvas layout =
    case canvas.learnSelectedNodeId of
        Nothing ->
            Html.div [ class "lv-canvas lv-canvas-empty" ]
                [ Html.text
                    (case layout of
                        DaVinciLayout ->
                            "Select a DaVinci node above to see its request lifecycle."

                        JourneyLayout ->
                            "Select a Journey step above to see its callback lifecycle."

                        _ ->
                            "Select an OIDC event above to see its details."
                    )
                ]

        Just nodeId ->
            let
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
                        (case layout of
                            DaVinciLayout ->
                                renderDaVinciCards events canvas nodeId

                            JourneyLayout ->
                                renderJourneyCards events canvas nodeId

                            OidcCodeLayout ->
                                renderOidcCodeCards events canvas nodeId

                            OidcDpopLayout ->
                                renderOidcDpopCards events canvas nodeId

                            OidcParLayout ->
                                renderOidcParCards events canvas nodeId
                        )
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



-- ── DaVinci Layout Cards ─────────────────────────────────────────────────────


renderDaVinciCards : List AuthEvent -> CanvasState -> String -> List (Svg Msg)
renderDaVinciCards events canvas nodeId =
    let
        maybeNode =
            Helpers.findEventInList nodeId events

        directNetEvents =
            List.filter (\e -> e.causedBy == Just nodeId) events
                |> List.sortBy .timestamp

        netEvents =
            if not (List.isEmpty directNetEvents) then
                directNetEvents

            else
                inferNetworkEvents nodeId events

        requestEvent =
            List.head netEvents

        responseEvent =
            List.head (List.reverse netEvents)

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
                "#F85149"

            else if serverHasError then
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
    [ renderCard BrowserCard bx by fW fH browserBorder "1" "" canvas.expandedCard
        (browserIcon (bx + 30) (by + 20))
        "BROWSER"
        (if corsError then "CORS blocked" else "Sends request")
    , expandedPanel BrowserCard bx (by + fH + 8) fW canvas.expandedCard
        (browserDetail requestEvent corsError)
    , renderArrowLine (bx + fW) (by + fH / 2) sx (sy + fH / 2) (requestMethod ++ " →") requestArrowColor False
    , renderCard ServerCard sx sy fW fH serverBorder "1" "" canvas.expandedCard
        (serverIcon (sx + 40) (sy + 15))
        "SERVER"
        (if serverHasError then "✕ " ++ responseStatus else responseStatus ++ " OK")
    , expandedPanel ServerCard sx (sy + fH + 8) fW canvas.expandedCard
        (serverDetail responseEvent serverHasError)
    , renderArrowLine (sx + fW) (sy + fH / 2) sdx (sdy + fH / 2) responseArrowLabel responseArrowColor False
    , renderCard SdkCard sdx sdy fW fH sdkBorder "1" "" canvas.expandedCard
        (sdkIcon (sdx + 35) (sdy + 20))
        "SDK"
        sdkContextLine
    , expandedPanel SdkCard sdx (sdy + fH + 8) fW canvas.expandedCard
        (sdkDetail maybeNode sdkNodeError serverHasError)
    , renderArrowLine (sdx + fW) (sdy + fH / 2) fx (fy + fH / 2) "renders" "#484F58" True
    , renderCard FormCard fx fy fW fH formBorder formOpacity formDash canvas.expandedCard
        (formIcon (fx + 35) (fy + 18))
        "FORM"
        formContextLine
    , expandedPanel FormCard fx (fy + fH + 8) fW canvas.expandedCard
        (formDetail maybeNode)
    ]
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



-- ── Journey Layout Cards ─────────────────────────────────────────────────────


renderJourneyCards : List AuthEvent -> CanvasState -> String -> List (Svg Msg)
renderJourneyCards events canvas nodeId =
    let
        maybeNode =
            Helpers.findEventInList nodeId events

        directNetEvents =
            List.filter (\e -> e.causedBy == Just nodeId) events
                |> List.sortBy .timestamp

        netEvents =
            if not (List.isEmpty directNetEvents) then
                directNetEvents

            else
                inferNetworkEvents nodeId events

        requestEvent =
            List.head netEvents

        responseEvent =
            List.head (List.reverse netEvents)

        journeyData =
            case maybeNode of
                Just n ->
                    case n.data of
                        Journey j ->
                            Just j

                        _ ->
                            Nothing

                Nothing ->
                    Nothing

        stepType =
            Maybe.andThen .stepType journeyData |> Maybe.withDefault "Step"

        isSuccess =
            stepType == "LoginSuccess"

        isFailure =
            stepType == "LoginFailure"

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

        anyError =
            isFailure || serverHasError

        hasCallbacks =
            case journeyData of
                Just j ->
                    j.callbacks /= Nothing && j.callbacks /= Just []

                Nothing ->
                    False

        callbackCount =
            case journeyData of
                Just j ->
                    case j.callbacks of
                        Just cs ->
                            List.length cs

                        Nothing ->
                            0

                Nothing ->
                    0

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

        responseStatus =
            case responseEvent of
                Just re ->
                    case re.data of
                        Network nd ->
                            Maybe.map String.fromInt nd.status |> Maybe.withDefault "—"

                        _ ->
                            "—"

                Nothing ->
                    "—"

        noNetEvents =
            List.isEmpty netEvents

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

        getOffset key =
            List.filter (\( k, _ ) -> k == key) canvas.cardPositions
                |> List.head
                |> Maybe.map Tuple.second
                |> Maybe.withDefault { x = 0, y = 0 }

        clientOff =
            getOffset "client"

        serverOff =
            getOffset "server"

        cbOff =
            getOffset "callbacks"

        resultOff =
            getOffset "result"

        fW =
            toFloat cardW

        fH =
            toFloat cardH

        cx =
            toFloat startX + clientOff.x

        cy =
            toFloat y + clientOff.y

        sx =
            toFloat (startX + cardW + gap) + serverOff.x

        sy =
            toFloat y + serverOff.y

        cbx =
            toFloat (startX + 2 * (cardW + gap)) + cbOff.x

        cby =
            toFloat y + cbOff.y

        rx =
            toFloat (startX + 3 * (cardW + gap)) + resultOff.x

        ry =
            toFloat y + resultOff.y

        clientBorder =
            "#58A6FF"

        serverBorder =
            if serverHasError then
                "#F85149"

            else
                "#D29922"

        callbacksBorder =
            if hasCallbacks && not anyError then
                "#A371F7"

            else
                "#484F58"

        callbacksOpacity =
            if hasCallbacks && not anyError then
                "1"

            else
                "0.4"

        callbacksDash =
            if hasCallbacks && not anyError then
                ""

            else
                "4,4"

        resultBorder =
            if isFailure then
                "#F85149"

            else if isSuccess then
                "#3FB950"

            else
                "#484F58"

        resultOpacity =
            if isSuccess || isFailure then
                "1"

            else
                "0.4"

        resultDash =
            if isSuccess || isFailure then
                ""

            else
                "4,4"

        responseLabel =
            if serverHasError then
                "✕ " ++ responseStatus

            else
                "← " ++ responseStatus

        responseColor =
            if serverHasError then
                "#F85149"

            else
                "#D29922"

        callbacksContextLine =
            if anyError then
                "Skipped"

            else if hasCallbacks then
                String.fromInt callbackCount ++ " callbacks"

            else
                "No callbacks"

        resultContextLine =
            if isFailure then
                "Login failed"

            else if isSuccess then
                "Login success"

            else
                "Pending"

        pulseTarget =
            if serverHasError then
                Just ( sx, sy )

            else if isFailure then
                Just ( rx, ry )

            else
                Nothing
    in
    [ -- Client card
      renderCard ClientCard cx cy fW fH clientBorder "1" "" canvas.expandedCard
        (browserIcon (cx + 30) (cy + 20))
        "CLIENT"
        "Sends auth request"
    , expandedPanel ClientCard cx (cy + fH + 8) fW canvas.expandedCard
        (journeyClientDetail requestEvent)

    -- Arrow: Client -> AM Server
    , renderArrowLine (cx + fW) (cy + fH / 2) sx (sy + fH / 2) (requestMethod ++ " →") "#58A6FF" False

    -- AM Server card
    , renderCard ServerCard sx sy fW fH serverBorder "1" "" canvas.expandedCard
        (serverIcon (sx + 40) (sy + 15))
        "AM SERVER"
        (if serverHasError then "✕ " ++ responseStatus else "Sends callbacks")
    , expandedPanel ServerCard sx (sy + fH + 8) fW canvas.expandedCard
        (journeyServerDetail responseEvent journeyData serverHasError)

    -- Arrow: Server -> Callbacks
    , renderArrowLine (sx + fW) (sy + fH / 2) cbx (cby + fH / 2) responseLabel responseColor False

    -- Callbacks card
    , renderCard CallbacksCard cbx cby fW fH callbacksBorder callbacksOpacity callbacksDash canvas.expandedCard
        (formIcon (cbx + 35) (cby + 18))
        "CALLBACKS"
        callbacksContextLine
    , expandedPanel CallbacksCard cbx (cby + fH + 8) fW canvas.expandedCard
        (journeyCallbacksDetail journeyData)

    -- Arrow: Callbacks -> Result
    , renderArrowLine (cbx + fW) (cby + fH / 2) rx (ry + fH / 2) "submits" "#484F58" True

    -- Result card
    , renderCard ResultCard rx ry fW fH resultBorder resultOpacity resultDash canvas.expandedCard
        (sdkIcon (rx + 35) (ry + 20))
        "RESULT"
        resultContextLine
    , expandedPanel ResultCard rx (ry + fH + 8) fW canvas.expandedCard
        (journeyResultDetail journeyData)
    ]
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
                    [ SA.x (String.fromFloat (cx + fW + toFloat gap / 2))
                    , SA.y (String.fromFloat (cy + fH + 30))
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



-- ── Journey Detail Panels ───────────────────────────────────────────────────


journeyClientDetail : Maybe AuthEvent -> List (Html Msg)
journeyClientDetail requestEvent =
    case requestEvent of
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


journeyServerDetail : Maybe AuthEvent -> Maybe JourneyData -> Bool -> List (Html Msg)
journeyServerDetail responseEvent journeyData isError =
    let
        networkRows =
            case responseEvent of
                Just re ->
                    case re.data of
                        Network nd ->
                            let
                                statusStr =
                                    Maybe.map String.fromInt nd.status |> Maybe.withDefault "—"

                                statusColor =
                                    if isError then
                                        "#F85149"

                                    else
                                        "#3FB950"
                            in
                            [ detailRowColored "Status" statusStr statusColor ]

                        _ ->
                            []

                Nothing ->
                    []

        journeyRows =
            case journeyData of
                Just j ->
                    List.filterMap identity
                        [ Maybe.map (detailRow "Stage") j.stage
                        , Maybe.map (detailRow "Header") j.header
                        , Maybe.map (detailRow "AuthId") (Maybe.map (truncate_ 16) j.authId)
                        ]

                Nothing ->
                    []
    in
    networkRows ++ journeyRows


journeyCallbacksDetail : Maybe JourneyData -> List (Html Msg)
journeyCallbacksDetail journeyData =
    case journeyData of
        Just j ->
            case j.callbacks of
                Just cs ->
                    if List.isEmpty cs then
                        [ Html.text "No callbacks" ]

                    else
                        [ detailRow "Count" (String.fromInt (List.length cs)) ]

                Nothing ->
                    [ Html.text "No callbacks" ]

        Nothing ->
            [ Html.text "No journey data" ]


journeyResultDetail : Maybe JourneyData -> List (Html Msg)
journeyResultDetail journeyData =
    case journeyData of
        Just j ->
            let
                stepType =
                    Maybe.withDefault "Step" j.stepType

                errorRows =
                    case j.errorMessage of
                        Just msg ->
                            [ detailRowColored "Error" msg "#F85149" ]
                                ++ (case j.errorReason of
                                        Just reason ->
                                            [ detailRow "Reason" reason ]

                                        Nothing ->
                                            []
                                   )

                        Nothing ->
                            []

                successRows =
                    List.filterMap identity
                        [ Maybe.map (detailRow "Token ID") (Maybe.map (truncate_ 16) j.tokenId)
                        , Maybe.map (detailRow "Success URL") (Maybe.map truncateUrl j.successUrl)
                        ]
            in
            if stepType == "LoginFailure" then
                [ detailRowColored "Result" "Login Failed" "#F85149" ] ++ errorRows

            else if stepType == "LoginSuccess" then
                [ detailRowColored "Result" "Login Success" "#3FB950" ] ++ successRows

            else
                [ detailRow "Step" stepType ]

        Nothing ->
            [ Html.text "No journey data" ]



-- ── OIDC Code Layout Cards ──────────────────────────────────────────────────


renderOidcCodeCards : List AuthEvent -> CanvasState -> String -> List (Svg Msg)
renderOidcCodeCards events canvas nodeId =
    renderOidcGenericCards events canvas nodeId False False


renderOidcDpopCards : List AuthEvent -> CanvasState -> String -> List (Svg Msg)
renderOidcDpopCards events canvas nodeId =
    renderOidcGenericCards events canvas nodeId True False


renderOidcParCards : List AuthEvent -> CanvasState -> String -> List (Svg Msg)
renderOidcParCards events canvas nodeId =
    renderOidcGenericCards events canvas nodeId False True


renderOidcGenericCards : List AuthEvent -> CanvasState -> String -> Bool -> Bool -> List (Svg Msg)
renderOidcGenericCards events canvas nodeId showDpop showPar =
    let
        maybeNode =
            Helpers.findEventInList nodeId events

        -- Gather OIDC semantics from each phase across ALL events.
        -- The selected node might be an SDK OIDC event (from bridge) with
        -- no oidcSemantics — so we look at network events for the real data.
        allOidcEvents =
            List.filter Helpers.hasOidcSemantics events

        authorizeSem =
            findSemanticsForPhase "authorize" allOidcEvents

        tokenSem =
            findSemanticsForPhase "token" allOidcEvents

        parSem =
            findSemanticsForPhase "par" allOidcEvents

        -- Use the selected node's semantics if available, else composite
        sem =
            case Maybe.andThen .oidcSemantics maybeNode of
                Just s ->
                    Just s

                Nothing ->
                    -- Pick the most informative semantics we have
                    case tokenSem of
                        Just _ ->
                            tokenSem

                        Nothing ->
                            authorizeSem

        isError =
            case maybeNode of
                Just n ->
                    n.isError

                Nothing ->
                    False

        hasOidcError =
            List.any
                (\e ->
                    case e.oidcSemantics of
                        Just s ->
                            s.errorCode /= Nothing

                        Nothing ->
                            False
                )
                allOidcEvents

        anyError =
            isError || hasOidcError

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

        getOffset key =
            List.filter (\( k, _ ) -> k == key) canvas.cardPositions
                |> List.head
                |> Maybe.map Tuple.second
                |> Maybe.withDefault { x = 0, y = 0 }

        -- Card positions for OIDC layout: Client -> (PAR?) -> AuthServer -> Token(+DPoP?) -> Result
        clientOff =
            getOffset "client"

        clientX =
            toFloat startX + clientOff.x

        clientY =
            toFloat y + clientOff.y

        fW =
            toFloat cardW

        fH =
            toFloat cardH

        -- Calculate positions based on whether PAR is shown
        parIdx =
            if showPar then
                1

            else
                -1

        authIdx =
            if showPar then
                2

            else
                1

        tokenIdx =
            if showPar then
                3

            else
                2

        resultIdx =
            if showPar then
                4

            else
                3

        cardXAt idx =
            toFloat (startX + idx * (cardW + gap))

        parOff =
            getOffset "par"

        authOff =
            getOffset "authserver"

        tokenOff =
            getOffset "token"

        resultOff =
            getOffset "result"

        authX =
            cardXAt authIdx + authOff.x

        authY =
            toFloat y + authOff.y

        tokenX =
            cardXAt tokenIdx + tokenOff.x

        tokenY =
            toFloat y + tokenOff.y

        resultX =
            cardXAt resultIdx + resultOff.x

        resultY =
            toFloat y + resultOff.y

        -- Use the selected node's phase for context, or fall back to authorize
        phase =
            case Maybe.andThen .oidcSemantics maybeNode of
                Just s ->
                    Maybe.withDefault "—" s.oidcPhase

                Nothing ->
                    -- SDK OIDC event — check data._tag oidc phase
                    case maybeNode of
                        Just n ->
                            case n.data of
                                Oidc oidc ->
                                    Maybe.withDefault "—" oidc.phase

                                _ ->
                                    "—"

                        Nothing ->
                            "—"

        clientBorder =
            "#58A6FF"

        authBorder =
            if hasOidcError then
                "#F85149"

            else
                "#D29922"

        tokenBorder =
            if showDpop then
                "#A371F7"

            else
                "#3FB950"

        tokenLabel =
            if showDpop then
                "TOKEN+DPoP"

            else
                "TOKEN"

        resultBorder =
            if anyError then
                "#484F58"

            else
                "#3FB950"

        resultOpacity =
            if anyError then
                "0.4"

            else
                "1"

        resultDash =
            if anyError then
                "4,4"

            else
                ""

        phaseContextLine =
            case phase of
                "authorize" ->
                    "Redirects user"

                "token" ->
                    "Exchanges code"

                "par" ->
                    "Pushes auth params"

                "userinfo" ->
                    "Gets user info"

                _ ->
                    phase
    in
    -- Client card
    [ renderCard ClientCard clientX clientY fW fH clientBorder "1" "" canvas.expandedCard
        (browserIcon (clientX + 30) (clientY + 20))
        "CLIENT"
        phaseContextLine
    , expandedPanel ClientCard clientX (clientY + fH + 8) fW canvas.expandedCard
        (oidcClientDetail authorizeSem)
    ]
        ++ -- PAR card (if needed)
           (if showPar then
                let
                    parX =
                        cardXAt parIdx + parOff.x

                    parY =
                        toFloat y + parOff.y
                in
                [ renderArrowLine (clientX + fW) (clientY + fH / 2) parX (parY + fH / 2) "POST →" "#D29922" False
                , renderCard ParCard parX parY fW fH "#D29922" "1" "" canvas.expandedCard
                    (serverIcon (parX + 40) (parY + 15))
                    "PAR"
                    "Pushes params"
                , expandedPanel ParCard parX (parY + fH + 8) fW canvas.expandedCard
                    (oidcParDetail parSem)
                , renderArrowLine (parX + fW) (parY + fH / 2) authX (authY + fH / 2) "request_uri →" "#D29922" False
                ]

            else
                [ renderArrowLine (clientX + fW) (clientY + fH / 2) authX (authY + fH / 2) "authorize →" "#58A6FF" False
                ]
           )
        ++ -- Auth Server card
           [ renderCard AuthServerCard authX authY fW fH authBorder "1" "" canvas.expandedCard
                (serverIcon (authX + 40) (authY + 15))
                "AUTH SERVER"
                (if hasOidcError then "Error" else "Issues code")
           , expandedPanel AuthServerCard authX (authY + fH + 8) fW canvas.expandedCard
                (oidcAuthServerDetail authorizeSem)
           , renderArrowLine (authX + fW) (authY + fH / 2) tokenX (tokenY + fH / 2) "code →" "#3FB950" False

           -- Token card
           , renderCard TokenCard tokenX tokenY fW fH tokenBorder "1" "" canvas.expandedCard
                (sdkIcon (tokenX + 35) (tokenY + 20))
                tokenLabel
                "Exchanges code"
           , expandedPanel TokenCard tokenX (tokenY + fH + 8) fW canvas.expandedCard
                (oidcTokenDetail tokenSem showDpop)
           , renderArrowLine (tokenX + fW) (tokenY + fH / 2) resultX (resultY + fH / 2) "tokens →" "#3FB950" False

           -- Result card
           , renderCard ResultCard resultX resultY fW fH resultBorder resultOpacity resultDash canvas.expandedCard
                (formIcon (resultX + 35) (resultY + 18))
                "RESULT"
                (if anyError then "Error" else "Tokens received")
           , expandedPanel ResultCard resultX (resultY + fH + 8) fW canvas.expandedCard
                (oidcResultDetail tokenSem)
           ]



-- ── OIDC Data Lookup ────────────────────────────────────────────────────────


{-| Find the OIDC semantics for a specific phase from any event in the list.
This lets the Learn tab show data from the network event even when the
selected rail node is an SDK OIDC bridge event (which lacks oidcSemantics).
-}
findSemanticsForPhase : String -> List AuthEvent -> Maybe OidcSemanticData
findSemanticsForPhase phase events =
    events
        |> List.filter
            (\e ->
                case e.oidcSemantics of
                    Just s ->
                        s.oidcPhase == Just phase

                    Nothing ->
                        False
            )
        |> List.reverse
        |> List.head
        |> Maybe.andThen .oidcSemantics



-- ── OIDC Detail Panels ──────────────────────────────────────────────────────


oidcClientDetail : Maybe OidcSemanticData -> List (Html Msg)
oidcClientDetail maybeSem =
    case maybeSem of
        Nothing ->
            [ Html.text "No OIDC data" ]

        Just sem ->
            List.filterMap identity
                [ Maybe.map (detailRow "Client ID") sem.clientId
                , Maybe.map (detailRow "State") sem.stateParam
                , if sem.hasPkce then
                    Just (detailRowColored "PKCE" "Enabled" "#3FB950")

                  else
                    Just (detailRowColored "PKCE" "Not detected" "#D29922")
                ]


oidcParDetail : Maybe OidcSemanticData -> List (Html Msg)
oidcParDetail maybeSem =
    case maybeSem of
        Nothing ->
            [ Html.text "No PAR data" ]

        Just sem ->
            List.filterMap identity
                [ Maybe.map (detailRow "request_uri") sem.parRequestUri
                , Maybe.map (detailRow "Client ID") sem.clientId
                ]


oidcAuthServerDetail : Maybe OidcSemanticData -> List (Html Msg)
oidcAuthServerDetail maybeSem =
    case maybeSem of
        Nothing ->
            [ Html.text "No auth server data" ]

        Just sem ->
            let
                errorRows =
                    case sem.errorCode of
                        Just code ->
                            [ detailRowColored "Error" code "#F85149" ]
                                ++ (case sem.errorDescription of
                                        Just desc ->
                                            [ detailRow "Description" desc ]

                                        Nothing ->
                                            []
                                   )

                        Nothing ->
                            [ detailRowColored "Status" "OK" "#3FB950" ]
            in
            errorRows


oidcTokenDetail : Maybe OidcSemanticData -> Bool -> List (Html Msg)
oidcTokenDetail maybeSem showDpop =
    case maybeSem of
        Nothing ->
            [ Html.text "No token data" ]

        Just sem ->
            List.filterMap identity
                [ Maybe.map (detailRow "Grant") sem.grantType
                , if sem.hasPkce then
                    Just (detailRow "code_verifier" "present")

                  else
                    Nothing
                , if showDpop && sem.hasDpop then
                    Just (detailRowColored "DPoP" "Proof attached" "#A371F7")

                  else if showDpop then
                    Just (detailRowColored "DPoP" "Missing proof" "#F85149")

                  else
                    Nothing
                , Maybe.map (detailRow "Token Type") sem.tokenType
                ]


oidcResultDetail : Maybe OidcSemanticData -> List (Html Msg)
oidcResultDetail maybeSem =
    case maybeSem of
        Nothing ->
            [ Html.text "No result data" ]

        Just sem ->
            let
                errorRows =
                    case sem.errorCode of
                        Just code ->
                            [ detailRowColored "Error" code "#F85149" ]
                                ++ (case sem.errorDescription of
                                        Just desc ->
                                            [ detailRow "Description" desc ]

                                        Nothing ->
                                            []
                                   )

                        Nothing ->
                            []

                tokenRows =
                    if sem.hasTokens then
                        [ detailRowColored "Tokens" "Received" "#3FB950" ]
                            ++ (case sem.tokenType of
                                    Just tt ->
                                        [ detailRow "Type" tt ]

                                    Nothing ->
                                        []
                               )

                    else
                        [ detailRow "Tokens" "None" ]
            in
            errorRows ++ tokenRows



-- ── Shared Card Rendering ───────────────────────────────────────────────────


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
        [ Svg.rect
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
        , Svg.line
            [ SA.x1 (String.fromFloat x)
            , SA.y1 (String.fromFloat (y + 14))
            , SA.x2 (String.fromFloat (x + 100))
            , SA.y2 (String.fromFloat (y + 14))
            , SA.stroke "#58A6FF"
            , SA.strokeWidth "1"
            ]
            []
        , Svg.circle [ SA.cx (String.fromFloat (x + 8)), SA.cy (String.fromFloat (y + 7)), SA.r "2.5", SA.fill "#F85149" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 16)), SA.cy (String.fromFloat (y + 7)), SA.r "2.5", SA.fill "#D29922" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 24)), SA.cy (String.fromFloat (y + 7)), SA.r "2.5", SA.fill "#3FB950" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 50)), SA.cy (String.fromFloat (y + 38)), SA.r "12", SA.fill "none", SA.stroke "#58A6FF", SA.strokeWidth "1" ] []
        , Svg.ellipse [ SA.cx (String.fromFloat (x + 50)), SA.cy (String.fromFloat (y + 38)), SA.rx "5", SA.ry "12", SA.fill "none", SA.stroke "#58A6FF", SA.strokeWidth "0.7" ] []
        , Svg.line [ SA.x1 (String.fromFloat (x + 38)), SA.y1 (String.fromFloat (y + 38)), SA.x2 (String.fromFloat (x + 62)), SA.y2 (String.fromFloat (y + 38)), SA.stroke "#58A6FF", SA.strokeWidth "0.7" ] []
        ]


serverIcon : Float -> Float -> Svg Msg
serverIcon x y =
    Svg.g []
        [ Svg.ellipse
            [ SA.cx (String.fromFloat (x + 40))
            , SA.cy (String.fromFloat (y + 30))
            , SA.rx "38"
            , SA.ry "22"
            , SA.fill "none"
            , SA.stroke "#484F58"
            , SA.strokeWidth "1.5"
            ]
            []
        , Svg.circle [ SA.cx (String.fromFloat (x + 28)), SA.cy (String.fromFloat (y + 30)), SA.r "3", SA.fill "#3FB950" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 40)), SA.cy (String.fromFloat (y + 30)), SA.r "3", SA.fill "#3FB950" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 52)), SA.cy (String.fromFloat (y + 30)), SA.r "3", SA.fill "#58A6FF" ] []
        ]


sdkIcon : Float -> Float -> Svg Msg
sdkIcon x y =
    Svg.g []
        [ Svg.rect
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
        , Svg.circle [ SA.cx (String.fromFloat (x + 45)), SA.cy (String.fromFloat (y + 30)), SA.r "10", SA.fill "none", SA.stroke "#3FB950", SA.strokeWidth "1.5" ] []
        , Svg.circle [ SA.cx (String.fromFloat (x + 45)), SA.cy (String.fromFloat (y + 30)), SA.r "4", SA.fill "#3FB950" ] []
        ]


formIcon : Float -> Float -> Svg Msg
formIcon x y =
    Svg.g []
        [ Svg.rect
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
        , Svg.rect [ SA.x (String.fromFloat (x + 10)), SA.y (String.fromFloat (y + 10)), SA.width "70", SA.height "12", SA.rx "2", SA.fill "none", SA.stroke "#484F58", SA.strokeWidth "1" ] []
        , Svg.rect [ SA.x (String.fromFloat (x + 10)), SA.y (String.fromFloat (y + 28)), SA.width "70", SA.height "12", SA.rx "2", SA.fill "none", SA.stroke "#484F58", SA.strokeWidth "1" ] []
        , Svg.rect [ SA.x (String.fromFloat (x + 25)), SA.y (String.fromFloat (y + 46)), SA.width "40", SA.height "10", SA.rx "2", SA.fill "#A371F7", SA.fillOpacity "0.3", SA.stroke "#A371F7", SA.strokeWidth "1" ] []
        ]



-- ── Event correlation ────────────────────────────────────────────────────────


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


nodeColor : AuthEvent -> LearnLayout -> String
nodeColor event layout =
    case layout of
        DaVinciLayout ->
            case event.data of
                DaVinciNode node ->
                    Helpers.nodeColor (Maybe.withDefault Types.UnknownStatus node.nodeStatus)

                _ ->
                    "#484F58"

        JourneyLayout ->
            case event.data of
                Journey journey ->
                    case journey.stepType of
                        Just "LoginSuccess" ->
                            "#3FB950"

                        Just "LoginFailure" ->
                            "#F85149"

                        Just "Step" ->
                            "#58A6FF"

                        _ ->
                            "#484F58"

                _ ->
                    "#484F58"

        _ ->
            case event.oidcSemantics of
                Just sem ->
                    case sem.oidcPhase of
                        Just "authorize" ->
                            "#58A6FF"

                        Just "token" ->
                            "#3FB950"

                        Just "par" ->
                            "#D29922"

                        Just "discovery" ->
                            "#8B949E"

                        Just "userinfo" ->
                            "#A371F7"

                        _ ->
                            if sem.errorCode /= Nothing then
                                "#F85149"

                            else
                                "#484F58"

                Nothing ->
                    case event.data of
                        Oidc oidc ->
                            case oidc.status of
                                Just "error" ->
                                    "#F85149"

                                Just "success" ->
                                    "#3FB950"

                                _ ->
                                    "#58A6FF"

                        _ ->
                            "#484F58"


nodeLabel : AuthEvent -> LearnLayout -> String
nodeLabel event layout =
    case layout of
        DaVinciLayout ->
            case event.data of
                DaVinciNode node ->
                    node.nodeName
                        |> orMaybe node.eventName
                        |> Maybe.withDefault "—"

                _ ->
                    "—"

        JourneyLayout ->
            case event.data of
                Journey journey ->
                    journey.stage
                        |> orMaybe journey.header
                        |> orMaybe journey.stepType
                        |> Maybe.withDefault "—"

                _ ->
                    "—"

        _ ->
            case event.oidcSemantics of
                Just sem ->
                    Maybe.withDefault "oidc" sem.oidcPhase

                Nothing ->
                    case event.data of
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
