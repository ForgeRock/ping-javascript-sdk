module Update exposing (Msg(..), update)

import Dict
import Helpers
import Model exposing (Model)
import Set
import Types exposing (AuthEvent, DiagnosisResult, FlowHealth(..), ImportMeta, InspectorTab(..), SnapshotMeta, ViewMode(..))


type Msg
    = EventReceived AuthEvent
    | SelectEvent String
    | SelectNode String
    | SwitchTab InspectorTab
    | ToggleRecording
    | ClearFlow
    | ToggleExportMenu
    | CloseExportMenu
    | ExportJson
    | ExportMarkdown
    | ImportFlow
    | UpdateImportPaste String
    | SubmitImportPaste
    | CancelImportPaste
    | ImportMetaReceived ImportMeta
    | ImportError String
    | DecodeError String
    | DiagnosisReceived DiagnosisResult
    | ToggleSummary
    | SaveSnapshot
    | SwitchViewMode ViewMode
    | StartPlayback
    | StopPlayback
    | PlaybackTick
    | SelectFlowNode String
    | ToggleSubRow String
    | ResetPlayback
    | HoverNode (Maybe String)
    | CopyToClipboard String
    | ToggleSnapshotMenu
    | CloseSnapshotMenu
    | SnapshotsReceived (List SnapshotMeta)
    | LoadSnapshot String
    | DeleteSnapshot String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        EventReceived event ->
            if model.importedFlow /= Nothing then
                ( model, Cmd.none )

            else
                ( { model
                    | events = model.events ++ [ event ]
                    , eventsById = Dict.insert event.id event model.eventsById
                    , flowId =
                        case model.flowId of
                            Just _ ->
                                model.flowId

                            Nothing ->
                                event.flowId
                  }
                , Cmd.none
                )

        SelectEvent id ->
            let
                selectedEvent =
                    Helpers.findEvent id model.eventsById

                newTab =
                    case ( model.activeTab, selectedEvent ) of
                        ( CollectorsTab, Just e ) ->
                            if Helpers.eventType e /= Helpers.NodeChange then
                                HeadersTab
                            else
                                CollectorsTab

                        ( SessionTab, Just e ) ->
                            if Helpers.eventSource e /= Helpers.SessionSource then
                                HeadersTab
                            else
                                SessionTab

                        ( ConfigTab, Just e ) ->
                            if Helpers.eventType e /= Helpers.SdkConfig then
                                HeadersTab
                            else
                                ConfigTab

                        _ ->
                            model.activeTab
            in
            ( { model | selectedEventId = Just id, activeTab = newTab }, Cmd.none )

        SelectNode id ->
            ( { model | selectedEventId = Just id, activeTab = SdkStateTab }, Cmd.none )

        SwitchTab tab ->
            ( { model | activeTab = tab }, Cmd.none )

        ToggleRecording ->
            ( { model | recording = not model.recording }, Cmd.none )

        ClearFlow ->
            ( { model
                | events = []
                , eventsById = Dict.empty
                , selectedEventId = Nothing
                , flowId = Nothing
                , selectedNodeId = Nothing
                , expandedSubRows = Set.empty
                , isPlaying = False
                , playbackIndex = Nothing
                , importedFlow = Nothing
                , exportMenuOpen = False
                , recording = True
                , importPasteOpen = False
                , importPasteText = ""
              }
            , Cmd.none
            )

        ToggleExportMenu ->
            ( { model | exportMenuOpen = not model.exportMenuOpen }, Cmd.none )

        CloseExportMenu ->
            ( { model | exportMenuOpen = False }, Cmd.none )

        ExportJson ->
            ( { model | exportMenuOpen = False }, Cmd.none )

        ExportMarkdown ->
            ( { model | exportMenuOpen = False }, Cmd.none )

        ImportFlow ->
            ( { model | importPasteOpen = True, importPasteText = "", lastDecodeError = Nothing }, Cmd.none )

        UpdateImportPaste text ->
            ( { model | importPasteText = text }, Cmd.none )

        SubmitImportPaste ->
            ( { model | importPasteOpen = False, importPasteText = "" }, Cmd.none )

        CancelImportPaste ->
            ( { model | importPasteOpen = False, importPasteText = "" }, Cmd.none )

        ImportMetaReceived meta ->
            ( { model | importedFlow = Just meta, recording = False }, Cmd.none )

        ImportError errMsg ->
            ( { model | lastDecodeError = Just errMsg }, Cmd.none )

        DecodeError errMsg ->
            ( { model | lastDecodeError = Just errMsg }, Cmd.none )

        DiagnosisReceived result ->
            let
                shouldExpand =
                    model.recording
                        && (result.flowHealth == Error)
                        && model.summaryCollapsed
            in
            ( { model
                | diagnosis = Just result
                , summaryCollapsed =
                    if shouldExpand then
                        False

                    else
                        model.summaryCollapsed
              }
            , Cmd.none
            )

        ToggleSummary ->
            ( { model | summaryCollapsed = not model.summaryCollapsed }, Cmd.none )

        SaveSnapshot ->
            ( model, Cmd.none )

        SwitchViewMode mode ->
            ( { model
                | viewMode = mode
                , isPlaying = False
                , playbackIndex = Nothing
                , selectedNodeId = Nothing
              }
            , Cmd.none
            )

        StartPlayback ->
            let
                sdkNodes =
                    Helpers.sdkNodes model.events

                startIndex =
                    case model.playbackIndex of
                        Just n ->
                            if n >= List.length sdkNodes - 1 then
                                0
                            else
                                n

                        Nothing ->
                            0

                firstId =
                    sdkNodes
                        |> List.drop startIndex
                        |> List.head
                        |> Maybe.map .id
            in
            ( { model
                | isPlaying = True
                , playbackIndex = Just startIndex
                , selectedNodeId = firstId
                , expandedSubRows = Set.empty
              }
            , Cmd.none
            )

        StopPlayback ->
            ( { model | isPlaying = False }, Cmd.none )

        PlaybackTick ->
            if not model.isPlaying then
                ( model, Cmd.none )

            else
                let
                    sdkNodes =
                        Helpers.sdkNodes model.events

                    total =
                        List.length sdkNodes

                    nextIndex =
                        Maybe.map (\n -> n + 1) model.playbackIndex
                            |> Maybe.withDefault 0

                    isFinished =
                        nextIndex >= total

                    nextId =
                        List.head (List.drop nextIndex sdkNodes)
                            |> Maybe.map .id
                in
                if isFinished then
                    ( { model | isPlaying = False, playbackIndex = Nothing }, Cmd.none )

                else
                    ( { model
                        | playbackIndex = Just nextIndex
                        , selectedNodeId = nextId
                        , expandedSubRows = Set.empty
                      }
                    , Cmd.none
                    )

        SelectFlowNode id ->
            ( { model
                | selectedNodeId = Just id
                , expandedSubRows = Set.empty
              }
            , Cmd.none
            )

        ToggleSubRow key ->
            ( { model
                | expandedSubRows =
                    if Set.member key model.expandedSubRows then
                        Set.remove key model.expandedSubRows
                    else
                        Set.insert key model.expandedSubRows
              }
            , Cmd.none
            )

        ResetPlayback ->
            ( { model
                | playbackIndex = Nothing
                , isPlaying = False
                , selectedNodeId = Nothing
              }
            , Cmd.none
            )

        HoverNode maybeId ->
            ( { model | hoveredNodeId = maybeId }, Cmd.none )

        CopyToClipboard _ ->
            ( model, Cmd.none )

        ToggleSnapshotMenu ->
            ( { model | snapshotMenuOpen = not model.snapshotMenuOpen }, Cmd.none )

        CloseSnapshotMenu ->
            ( { model | snapshotMenuOpen = False }, Cmd.none )

        SnapshotsReceived list ->
            ( { model | snapshots = list }, Cmd.none )

        LoadSnapshot _ ->
            ( { model | snapshotMenuOpen = False }, Cmd.none )

        DeleteSnapshot id ->
            ( { model
                | snapshots = List.filter (\s -> s.id /= id) model.snapshots
              }
            , Cmd.none
            )
