module Inspector exposing (view)

import Helpers
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Json.Decode as Decode
import Json.Encode as Encode
import JsonTree
import Types exposing (AuthEvent, DiagnosisResult, EventData(..), EventIssue, EventKind(..), EventSource(..), InspectorTab(..), NetworkData, NodeData, NodeStatus(..), SdkAuthorization, SdkError, SessionData, Severity(..))
import Update exposing (Msg(..))


view : Maybe AuthEvent -> InspectorTab -> Maybe DiagnosisResult -> Html Msg
view selectedEvent activeTab maybeDiagnosis =
    div [ style "display" "flex", style "flex-direction" "column", style "height" "100%" ]
        [ viewTabs selectedEvent activeTab maybeDiagnosis
        , div [ class "insp-body" ]
            [ viewContent selectedEvent activeTab maybeDiagnosis ]
        ]


eventIssues : Maybe AuthEvent -> Maybe DiagnosisResult -> List EventIssue
eventIssues maybeEvent maybeDiagnosis =
    case ( maybeEvent, maybeDiagnosis ) of
        ( Just event, Just diagnosis ) ->
            diagnosis.annotatedEvents
                |> List.filter (\( id, _ ) -> id == event.id)
                |> List.concatMap (\( _, issues ) -> issues)

        _ ->
            []


viewTabs : Maybe AuthEvent -> InspectorTab -> Maybe DiagnosisResult -> Html Msg
viewTabs maybeEvent activeTab maybeDiagnosis =
    let
        isSdkEvent =
            case maybeEvent of
                Just event ->
                    event.kind == NodeChange

                Nothing ->
                    False

        isSessionEvent =
            case maybeEvent of
                Just event ->
                    event.source == SessionSource

                Nothing ->
                    False

        isConfigEvent =
            case maybeEvent of
                Just event ->
                    event.kind == SdkConfig

                Nothing ->
                    False

        issues =
            eventIssues maybeEvent maybeDiagnosis

        hasDiagnosis =
            not (List.isEmpty issues)

        diagnosisTabLabel =
            if List.any (\i -> i.severity == SevError) issues then
                "Diagnosis ●"

            else
                "Diagnosis ◐"
    in
    div [ class "tab-bar" ]
        ((if hasDiagnosis then
            [ tabButton diagnosisTabLabel DiagnosisTab activeTab ]

          else
            []
         )
            ++ [ tabButton "Headers"   HeadersTab  activeTab
               , tabButton "Cookies"   CookiesTab  activeTab
               , tabButton "CORS"      CorsTab     activeTab
               , tabButton "SDK State" SdkStateTab activeTab
               ]
            ++ (if isSdkEvent then
                    [ tabButton "Collectors" CollectorsTab activeTab ]

                else
                    []
               )
            ++ (if isSessionEvent then
                    [ tabButton "Session" SessionTab activeTab ]

                else
                    []
               )
            ++ (if isConfigEvent then
                    [ tabButton "Config" ConfigTab activeTab ]

                else
                    []
               )
        )


tabButton : String -> InspectorTab -> InspectorTab -> Html Msg
tabButton label tab activeTab =
    let
        cls =
            if tab == activeTab then "tab-btn active" else "tab-btn"
    in
    button [ onClick (SwitchTab tab), class cls ] [ text label ]


viewContent : Maybe AuthEvent -> InspectorTab -> Maybe DiagnosisResult -> Html Msg
viewContent maybeEvent activeTab maybeDiagnosis =
    case ( maybeEvent, activeTab ) of
        ( Nothing, _ ) ->
            div [ class "insp-empty" ] [ text "Select a request to inspect" ]

        ( Just event, DiagnosisTab ) ->
            let
                issues =
                    eventIssues (Just event) maybeDiagnosis
            in
            if List.isEmpty issues then
                div [ class "insp-empty" ] [ text "No issues for this event." ]

            else
                div [] (List.map viewEventIssue issues)

        ( Just event, HeadersTab ) ->
            case event.data of
                Network net ->
                    div []
                        ([ div [ class "kv-row", style "margin-bottom" "8px" ]
                            [ span [ class "kv-key" ] [ text "URL" ]
                            , span [ class "kv-val" ] [ text (Maybe.withDefault "—" net.url) ]
                            ]
                         , div [ class "kv-row", style "margin-bottom" "8px" ]
                            [ span [ class "kv-key" ] [ text "Method" ]
                            , span [ class "kv-val" ] [ text (Maybe.withDefault "—" net.method) ]
                            ]
                         ]
                            ++ viewCausedBy event
                            ++ [ case net.requestHeaders of
                                    Just h  -> JsonTree.view "Request Headers" h
                                    Nothing -> viewEmptySection "Request Headers"
                               , case net.responseHeaders of
                                    Just h  -> JsonTree.view "Response Headers" h
                                    Nothing -> viewEmptySection "Response Headers"
                               ]
                            ++ (case net.requestBody of
                                    Just b  -> [ JsonTree.view "Request Body" b ]
                                    Nothing -> []
                               )
                            ++ (case net.responseBody of
                                    Just b  -> [ JsonTree.view "Response Body" b ]
                                    Nothing -> []
                               )
                        )

                _ ->
                    div [ class "insp-empty" ]
                        [ text "Select a network request to see headers." ]

        ( Just event, CookiesTab ) ->
            case event.data of
                Network net ->
                    div [] (viewCookies net)

                _ ->
                    div [ class "insp-empty" ] [ text "No cookies found in headers." ]

        ( Just event, CorsTab ) ->
            if event.isCors then
                let
                    urlText =
                        case event.data of
                            Network net ->
                                Maybe.withDefault "—" net.url

                            _ ->
                                "—"
                in
                div [ class "kv-row", style "color" "var(--red)", style "padding-top" "4px" ]
                    [ text ("CORS issue detected on " ++ urlText) ]

            else
                div [ class "kv-row", style "color" "var(--green)", style "padding-top" "4px" ]
                    [ text "No CORS issues detected for this request." ]

        ( Just event, SdkStateTab ) ->
            case event.data of
                DaVinciNode node ->
                    viewSdkState node

                _ ->
                    div [ class "insp-empty" ]
                        [ text "Select an SDK node row to inspect." ]

        ( Just event, CollectorsTab ) ->
            case event.data of
                DaVinciNode node ->
                    div [] (viewCollectors node)

                _ ->
                    div [ class "insp-empty" ] [ text "No collectors for this event type." ]

        ( Just event, SessionTab ) ->
            case event.data of
                Session sess ->
                    div [] (viewSession sess)

                _ ->
                    div [ class "insp-empty" ] [ text "No session data for this event type." ]

        ( Just event, ConfigTab ) ->
            case event.data of
                Config maybeCfg ->
                    div [] (viewConfig maybeCfg)

                _ ->
                    div [ class "insp-empty" ] [ text "No config data for this event type." ]


viewSdkState : NodeData -> Html Msg
viewSdkState node =
    div []
        (viewNodeSection node
            ++ viewInteractionSection node
            ++ viewErrorSection node
            ++ viewAuthorizationSection node
        )


nodeStatusValClass : NodeStatus -> String
nodeStatusValClass status =
    case status of
        StatusError -> "kv-val kv-bold kv-err"
        Failure     -> "kv-val kv-bold kv-err"
        Success     -> "kv-val kv-bold kv-ok"
        Continue    -> "kv-val kv-bold kv-cont"
        UnknownStatus -> "kv-val"


viewNodeSection : NodeData -> List (Html Msg)
viewNodeSection node =
    let
        statusRow =
            case node.nodeStatus of
                Just s ->
                    let
                        label =
                            Helpers.nodeStatusLabel s

                        arrow =
                            case node.previousStatus of
                                Just prev ->
                                    span []
                                        [ span [ class "kv-arrow" ] [ text (Helpers.nodeStatusLabel prev ++ " ") ]
                                        , span [ class "kv-arrow" ] [ text "→ " ]
                                        , span [ class (nodeStatusValClass s) ] [ text label ]
                                        ]

                                Nothing ->
                                    span [ class (nodeStatusValClass s) ] [ text label ]
                    in
                    [ viewRow "Status" arrow ]

                Nothing ->
                    []

        httpRow =
            case node.httpStatus of
                Just code ->
                    let
                        cls =
                            if code >= 400 then "kv-val kv-err" else "kv-val kv-ok"
                    in
                    [ viewRow "HTTP" (span [ class cls ] [ text (String.fromInt code) ]) ]

                Nothing ->
                    []
    in
    [ div [ class "sect-hdr" ] [ text "Node" ] ]
        ++ statusRow
        ++ httpRow
        ++ viewOptionalRow "Event"       node.eventName
        ++ viewOptionalRow "Form Name"   node.nodeName
        ++ viewOptionalRow "Description" node.nodeDescription


viewInteractionSection : NodeData -> List (Html Msg)
viewInteractionSection node =
    let
        rows =
            viewOptionalRow "Interaction ID" node.interactionId
                ++ viewOptionalRow "Node ID"      node.nodeId
                ++ viewOptionalRow "Request ID"   node.requestId
                ++ viewOptionalRow "Token"        node.interactionToken
    in
    if List.isEmpty rows then
        []

    else
        [ div [ class "sect-hdr" ] [ text "Interaction" ] ] ++ rows


viewErrorSection : NodeData -> List (Html Msg)
viewErrorSection node =
    case node.sdkError of
        Nothing ->
            []

        Just err ->
            let
                httpRow =
                    case err.internalHttpStatus of
                        Just code ->
                            [ viewRow "HTTP Status"
                                (span [ class "kv-val kv-err" ] [ text (String.fromInt code) ])
                            ]

                        Nothing ->
                            []
            in
            [ div [ class "sect-hdr" ] [ text "Error" ] ]
                ++ [ viewRow "Code"    (span [ class "kv-val kv-err kv-bold" ] [ text err.code ])
                   , viewRow "Type"    (span [ class "kv-val" ] [ text err.errorType ])
                   , viewRow "Message" (span [ class "kv-val" ] [ text err.message ])
                   ]
                ++ httpRow


viewAuthorizationSection : NodeData -> List (Html Msg)
viewAuthorizationSection node =
    let
        authRows =
            case node.authorization of
                Nothing   -> []
                Just auth ->
                    viewOptionalRow "Auth Code" auth.code
                        ++ viewOptionalRow "State" auth.state

        sessionRows =
            viewOptionalRow "Session ID" node.session

        rows =
            authRows ++ sessionRows
    in
    if List.isEmpty rows then
        []

    else
        [ div [ class "sect-hdr" ] [ text "Authorization" ] ] ++ rows


viewRow : String -> Html Msg -> Html Msg
viewRow label valueHtml =
    div [ class "kv-row" ]
        [ span [ class "kv-key" ] [ text label ]
        , valueHtml
        ]


viewOptionalRow : String -> Maybe String -> List (Html Msg)
viewOptionalRow label maybeValue =
    case maybeValue of
        Nothing ->
            []

        Just value ->
            [ viewRow label (span [ class "kv-val" ] [ text value ]) ]


viewEmptySection : String -> Html Msg
viewEmptySection label =
    div [ class "jt-sec" ]
        [ div [ class "jt-label" ] [ text label ]
        , div [ style "color" "var(--dim)", style "font-style" "italic", style "font-size" "11px" ]
            [ text "None" ]
        ]


viewCookies : NetworkData -> List (Html Msg)
viewCookies net =
    let
        cookieRows =
            case net.requestHeaders of
                Nothing ->
                    []

                Just rawHeaders ->
                    case Decode.decodeValue (Decode.field "cookie" Decode.string) rawHeaders of
                        Ok v ->
                            [ div [ class "kv-row" ]
                                [ span [ class "kv-key", style "color" "var(--orange)" ] [ text "cookie" ]
                                , span [ class "kv-val kv-ok" ] [ text v ]
                                ]
                            ]

                        Err (Decode.Field "cookie" _) ->
                            [ div [ class "kv-val kv-err", style "font-size" "11px" ]
                                [ text "cookie header present but could not be decoded" ]
                            ]

                        Err _ ->
                            []

        setCookieRows =
            case net.responseHeaders of
                Nothing ->
                    []

                Just rawHeaders ->
                    case Decode.decodeValue
                             (Decode.field "set-cookie"
                                 (Decode.oneOf
                                     [ Decode.map List.singleton Decode.string
                                     , Decode.list Decode.string
                                     ]
                                 )
                             )
                             rawHeaders of
                        Ok values ->
                            List.map
                                (\v ->
                                    div [ class "kv-row" ]
                                        [ span [ class "kv-key", style "color" "var(--orange)" ] [ text "set-cookie" ]
                                        , span [ class "kv-val kv-ok" ] [ text v ]
                                        ]
                                )
                                values

                        Err (Decode.Field "set-cookie" innerErr) ->
                            [ div [ class "kv-val kv-err", style "font-size" "11px" ]
                                [ text ("set-cookie format unexpected: " ++ Decode.errorToString innerErr) ]
                            ]

                        Err _ ->
                            []

        rows =
            cookieRows ++ setCookieRows
    in
    if List.isEmpty rows then
        [ div [ class "insp-empty" ] [ text "No cookies found in headers." ] ]

    else
        rows


viewCollectors : NodeData -> List (Html Msg)
viewCollectors node =
    case node.collectors of
        Nothing ->
            [ div [ class "insp-empty" ] [ text "No collectors on this node." ] ]

        Just [] ->
            [ div [ class "insp-empty" ] [ text "No collectors on this node." ] ]

        Just cs ->
            div [ class "coll-copy-all-row" ]
                [ button
                    [ class "fv-copy-btn coll-copy-all"
                    , onClick (CopyToClipboard (Encode.encode 4 (Encode.list identity cs)))
                    ]
                    [ text "Copy all" ]
                ]
                :: List.indexedMap
                    (\i c ->
                        div [ class "coll-card" ]
                            [ div [ class "coll-card-header" ]
                                [ span [] [ text ("Collector " ++ String.fromInt (i + 1)) ]
                                , button
                                    [ class "fv-copy-btn"
                                    , onClick (CopyToClipboard (Encode.encode 4 c))
                                    ]
                                    [ text "\u{2398}" ]
                                ]
                            , JsonTree.view ("Collector " ++ String.fromInt (i + 1)) c
                            ]
                    )
                    cs


viewCausedBy : AuthEvent -> List (Html Msg)
viewCausedBy event =
    case event.causedBy of
        Nothing ->
            []

        Just sdkEventId ->
            [ div [ class "kv-row", style "margin-bottom" "8px" ]
                [ span [ class "kv-key" ] [ text "Triggered by" ]
                , button
                    [ onClick (SelectEvent sdkEventId)
                    , class "cause-btn"
                    ]
                    [ text ("SDK Node " ++ String.left 8 sdkEventId) ]
                ]
            ]


viewSession : SessionData -> List (Html Msg)
viewSession sess =
    let
        keyLabel    = Maybe.withDefault "unknown" sess.key
        beforeValue = Maybe.withDefault "—" sess.before
        afterValue  = Maybe.withDefault "—" sess.after
    in
    [ div [ class "sect-hdr" ] [ text "Session Diff" ]
    , viewRow "Key"    (span [ class "kv-val" ] [ text keyLabel ])
    , viewRow "Before" (span [ class "kv-val kv-err" ] [ text beforeValue ])
    , viewRow "After"  (span [ class "kv-val kv-ok"  ] [ text afterValue ])
    ]


viewConfig : Maybe Decode.Value -> List (Html Msg)
viewConfig maybeCfg =
    case maybeCfg of
        Nothing ->
            [ div [ class "insp-empty" ] [ text "No config data on this event." ] ]

        Just cfg ->
            [ JsonTree.view "SDK Config" cfg ]


viewEventIssue : EventIssue -> Html Msg
viewEventIssue issue =
    let
        severityClass =
            case issue.severity of
                SevError   -> "diag-issue diag-issue-error"
                SevWarning -> "diag-issue diag-issue-warning"
                SevInfo    -> "diag-issue diag-issue-info"

        severityIcon =
            case issue.severity of
                SevError   -> "✕ "
                SevWarning -> "⚠ "
                SevInfo    -> "ℹ "

        stepItems =
            List.indexedMap
                (\i step ->
                    div [ class "diag-step" ]
                        [ text (String.fromInt (i + 1) ++ ". " ++ step) ]
                )
                issue.steps

        dataRows =
            case issue.relevantData of
                Nothing ->
                    []

                Just pairs ->
                    [ div [ class "diag-data" ]
                        (List.map
                            (\( k, v ) ->
                                div [ class "diag-kv" ]
                                    [ span [ class "diag-k" ] [ text k ]
                                    , span [ class "diag-v" ] [ text v ]
                                    ]
                            )
                            pairs
                        )
                    ]
    in
    div [ class severityClass ]
        ([ div [ class "diag-title" ] [ text (severityIcon ++ issue.title) ]
         , div [ class "diag-desc" ] [ text issue.description ]
         ]
            ++ (if List.isEmpty issue.steps then
                    []

                else
                    [ div [ class "diag-steps-hdr" ] [ text "What to check:" ]
                    , div [] stepItems
                    ]
               )
            ++ dataRows
        )
