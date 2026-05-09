module View exposing (view)

import FlowView
import Graph
import Helpers
import LearnView
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onInput)
import Inspector
import Model exposing (Model)
import Timeline
import Types exposing (AuthEvent, FlowHealth(..), FlowIssue, ImportMeta, Severity(..), SnapshotMeta, ViewMode(..))
import Update exposing (Msg(..))


view : Model -> Html Msg
view model =
    let
        selectedEvent =
            model.selectedEventId
                |> Maybe.andThen (\id -> Helpers.findEvent id model.eventsById)

        eventCount =
            List.length model.events
    in
    div [ class "layout" ]
        [ viewToolbar model eventCount
        , case model.lastDecodeError of
            Just errMsg ->
                div [ class "err-banner" ] [ text ("Bridge decode error: " ++ errMsg) ]

            Nothing ->
                text ""
        , viewImportBanner model
        , viewImportPaste model
        , viewFlowHealthPanel model
        , case model.viewMode of
            FlowMode ->
                FlowView.view
                    model.events
                    model.playbackIndex
                    model.selectedNodeId
                    model.expandedSubRows

            TimelineMode ->
                div [ class "timeline-layout" ]
                    [ div [ class "main-area" ]
                        [ div [ class "graph-panel" ]
                            [ div [ class "graph-panel-label" ] [ text "Flow" ]
                            , Graph.view model.events model.selectedEventId model.hoveredNodeId
                            ]
                        , div [ class "timeline-panel" ]
                            [ viewTimelineHeader
                            , Timeline.view model.events model.selectedEventId
                            ]
                        ]
                    , div [ class "inspector-panel" ]
                        [ Inspector.view selectedEvent model.activeTab model.diagnosis ]
                    ]

            LearnMode ->
                LearnView.view model.events model.learnCanvas
        ]


viewExportDropdown : Model -> Html Msg
viewExportDropdown model =
    div [ class "tb-dropdown" ]
        [ button [ onClick ToggleExportMenu, class "tb-btn" ] [ text "Export ▾" ]
        , if model.exportMenuOpen then
            div [ class "tb-dropdown-menu" ]
                [ button [ onClick ExportJson, class "tb-dropdown-item" ] [ text "Export JSON" ]
                , button [ onClick ExportMarkdown, class "tb-dropdown-item" ] [ text "Export Markdown" ]
                ]

          else
            text ""
        ]


viewSnapshotDropdown : Model -> Html Msg
viewSnapshotDropdown model =
    div [ class "tb-dropdown" ]
        [ button [ onClick SaveSnapshot, class "tb-btn" ] [ text "Snapshot" ]
        , button [ onClick ToggleSnapshotMenu, class "tb-btn tb-dropdown-arrow" ] [ text "▾" ]
        , if model.snapshotMenuOpen then
            div [ class "tb-dropdown-menu snapshot-menu" ]
                (if List.isEmpty model.snapshots then
                    [ div [ class "snapshot-empty" ] [ text "No saved snapshots" ] ]

                 else
                    List.map viewSnapshotItem model.snapshots
                )

          else
            text ""
        ]


viewSnapshotItem : SnapshotMeta -> Html Msg
viewSnapshotItem snap =
    div [ class "snapshot-item" ]
        [ div [ class "snapshot-item-info", onClick (LoadSnapshot snap.id) ]
            [ span [ class "snapshot-flow" ]
                [ text
                    (case snap.flowId of
                        Just fid ->
                            "flow " ++ Helpers.truncateId fid

                        Nothing ->
                            "flow (none)"
                    )
                ]
            , span [ class "snapshot-meta" ]
                [ text
                    (" · " ++ String.left 16 snap.savedAt ++ " · " ++ String.fromInt snap.eventCount ++ " events")
                ]
            ]
        , button
            [ onClick (DeleteSnapshot snap.id)
            , class "snapshot-delete"
            ]
            [ text "✕" ]
        ]


viewImportBanner : Model -> Html Msg
viewImportBanner model =
    case model.importedFlow of
        Nothing ->
            text ""

        Just meta ->
            div [ class "import-banner" ]
                [ span []
                    [ text
                        ("Imported flow "
                            ++ (case meta.flowId of
                                    Just id ->
                                        Helpers.truncateId id

                                    Nothing ->
                                        "(unknown)"
                               )
                            ++ " · captured "
                            ++ String.left 16 meta.capturedAt
                            ++ (if meta.redacted then
                                    " · redacted"

                                else
                                    ""
                               )
                        )
                    ]
                , button [ onClick ClearFlow, class "import-banner-clear" ] [ text "Clear" ]
                ]


viewImportPaste : Model -> Html Msg
viewImportPaste model =
    if not model.importPasteOpen then
        text ""

    else
        div [ class "import-paste" ]
            [ div [ class "import-paste-header" ]
                [ span [] [ text "Paste exported flow JSON below" ]
                , div [ class "import-paste-actions" ]
                    [ button
                        [ onClick SubmitImportPaste
                        , class "tb-btn"
                        , disabled (String.isEmpty (String.trim model.importPasteText))
                        ]
                        [ text "Import" ]
                    , button [ onClick CancelImportPaste, class "tb-btn" ] [ text "Cancel" ]
                    ]
                ]
            , textarea
                [ class "import-paste-textarea"
                , placeholder "Paste exported JSON here (Ctrl/Cmd+V)"
                , value model.importPasteText
                , onInput UpdateImportPaste
                ]
                []
            ]


viewFlowHealthPanel : Model -> Html Msg
viewFlowHealthPanel model =
    case model.diagnosis of
        Nothing ->
            text ""

        Just diagnosis ->
            case diagnosis.flowHealth of
                Healthy ->
                    text ""

                _ ->
                    let
                        ( healthClass, healthLabel ) =
                            case diagnosis.flowHealth of
                                Error   -> ( "fh-panel fh-error", "● ERROR" )
                                Warning -> ( "fh-panel fh-warning", "● WARNING" )
                                Healthy -> ( "fh-panel", "" )

                        issueCount =
                            List.length diagnosis.issues

                        flowLabel =
                            case model.flowId of
                                Just id -> "Flow: " ++ Helpers.truncateId id
                                Nothing -> ""

                        summary =
                            healthLabel
                                ++ (if String.isEmpty flowLabel then "" else "  " ++ flowLabel)
                                ++ "  "
                                ++ String.fromInt issueCount
                                ++ (if issueCount == 1 then " issue found" else " issues found")
                    in
                    div [ class healthClass ]
                        [ div [ class "fh-header" ]
                            [ span [ class "fh-title" ] [ text "Flow Health" ]
                            , span [ class "fh-summary" ] [ text summary ]
                            , button [ onClick ToggleSummary, class "fh-collapse-btn" ]
                                [ text
                                    (if model.summaryCollapsed then "▶" else "▼")
                                ]
                            ]
                        , if model.summaryCollapsed then
                            text ""

                          else
                            div [ class "fh-issues" ]
                                (List.map viewFlowIssue diagnosis.issues)
                        ]


viewFlowIssue : FlowIssue -> Html Msg
viewFlowIssue issue =
    let
        ( issueClass, icon ) =
            case issue.severity of
                SevError   -> ( "fh-issue fh-issue-error", "✕ " )
                SevWarning -> ( "fh-issue fh-issue-warning", "⚠ " )
                SevInfo    -> ( "fh-issue fh-issue-info", "ℹ " )

        firstEventId =
            List.head issue.relatedEventIds
    in
    div
        (class issueClass
            :: (case firstEventId of
                    Just eid -> [ onClick (SelectEvent eid) ]
                    Nothing  -> []
               )
        )
        [ span [ class "fh-issue-cat" ] [ text (String.toUpper issue.category) ]
        , span [ class "fh-issue-title" ] [ text (" — " ++ icon ++ issue.title) ]
        , div [ class "fh-issue-desc" ] [ text issue.description ]
        ]


viewTimelineHeader : Html Msg
viewTimelineHeader =
    div [ class "tl-header" ]
        [ span [ class "tl-badge tl-hdr-label" ] [ text "Type" ]
        , span [ class "tl-st tl-hdr-label" ] [ text "Status" ]
        , span [ class "tl-meth tl-hdr-label" ] [ text "Method" ]
        , span [ class "tl-desc tl-hdr-label" ] [ text "URL / Description" ]
        , span [ class "tl-dur tl-hdr-label" ] [ text "Time" ]
        ]


viewToolbar : Model -> Int -> Html Msg
viewToolbar model eventCount =
    div [ class "toolbar" ]
        [ if model.recording then
            button [ onClick ToggleRecording, class "tb-btn recording" ]
                [ span [ class "rec-dot" ] []
                , text "Recording"
                ]

          else
            button [ onClick ToggleRecording, class "tb-btn" ]
                [ text "Record" ]
        , div [ class "tb-sep" ] []
        , button [ onClick ClearFlow, class "tb-btn" ] [ text "Clear" ]
        , viewExportDropdown model
        , button [ onClick ImportFlow, class "tb-btn" ] [ text "Import" ]
        , viewSnapshotDropdown model
        , div [ class "tb-sep" ] []
        , button
            [ onClick (SwitchViewMode TimelineMode)
            , class
                (if model.viewMode == TimelineMode then
                    "tb-btn tb-mode-btn active"

                 else
                    "tb-btn tb-mode-btn"
                )
            ]
            [ text "Timeline" ]
        , button
            [ onClick (SwitchViewMode FlowMode)
            , class
                (if model.viewMode == FlowMode then
                    "tb-btn tb-mode-btn active"

                 else
                    "tb-btn tb-mode-btn"
                )
            ]
            [ text "Flow" ]
        , button
            [ onClick (SwitchViewMode LearnMode)
            , class
                (if model.viewMode == LearnMode then
                    "tb-btn tb-mode-btn active"

                 else
                    "tb-btn tb-mode-btn"
                )
            ]
            [ text "Learn" ]
        , div [ class "tb-spacer" ] []
        , if model.viewMode == FlowMode then
            FlowView.viewPlaybackControls model.events model.playbackIndex model.isPlaying

          else if model.viewMode == LearnMode then
            text ""

          else if eventCount > 0 then
            span [ class "event-count" ] [ text (String.fromInt eventCount ++ " events") ]

          else
            text ""
        , case model.flowId of
            Just id ->
                span [ class "flow-chip" ]
                    [ text "flow "
                    , span [ class "flow-chip-id" ] [ text (Helpers.truncateId id) ]
                    ]

            Nothing ->
                span [ class "no-flow" ] [ text "No active flow" ]
        , viewConnectionStatus model.events
        ]


viewConnectionStatus : List AuthEvent -> Html Msg
viewConnectionStatus events =
    let
        hasSdkEvents =
            List.any Helpers.isSdkNode events

        hasOidcEvents =
            List.any Helpers.hasOidcSemantics events
    in
    if hasSdkEvents then
        span [ class "flow-chip" ]
            [ span [ class "flow-chip-id", style "color" "#3FB950" ] [ text "SDK connected" ] ]

    else if hasOidcEvents then
        span [ class "flow-chip" ]
            [ span [ class "flow-chip-id", style "color" "#58A6FF" ] [ text "OIDC detected" ] ]

    else
        text ""
