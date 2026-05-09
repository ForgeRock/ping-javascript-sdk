module Update exposing (Msg(..), update)

import Dict
import Helpers
import Model exposing (Model)
import Set
import Types exposing (AuthEvent, CanvasState, CardId(..), DiagnosisResult, EventData(..), EventKind(..), EventSource(..), FlowHealth(..), ImportMeta, InspectorTab(..), SnapshotMeta, Vec2, ViewMode(..))


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
    | LearnSelectNode String
    | LearnExpandCard CardId
    | LearnCollapseCard
    | LearnStartDrag CardId Float Float
    | LearnDrag Float Float
    | LearnEndDrag
    | LearnStartPan Float Float
    | LearnPan Float Float
    | LearnEndPan
    | LearnZoom Float


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
                            if e.kind /= NodeChange then
                                HeadersTab
                            else
                                CollectorsTab

                        ( SessionTab, Just e ) ->
                            if e.source /= SessionSource then
                                HeadersTab
                            else
                                SessionTab

                        ( ConfigTab, Just e ) ->
                            if e.kind /= SdkConfig then
                                HeadersTab
                            else
                                ConfigTab

                        ( OidcTab, Just e ) ->
                            if e.oidcSemantics == Nothing then
                                HeadersTab
                            else
                                OidcTab

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

        LearnSelectNode nodeId ->
            let
                canvas =
                    model.learnCanvas
            in
            ( { model
                | learnCanvas =
                    { canvas
                        | learnSelectedNodeId = Just nodeId
                        , expandedCard = Nothing
                        , cardPositions = []
                    }
              }
            , Cmd.none
            )

        LearnExpandCard cardId ->
            let
                canvas =
                    model.learnCanvas

                newExpanded =
                    if canvas.expandedCard == Just cardId then
                        Nothing

                    else
                        Just cardId
            in
            ( { model | learnCanvas = { canvas | expandedCard = newExpanded } }
            , Cmd.none
            )

        LearnCollapseCard ->
            let
                canvas =
                    model.learnCanvas
            in
            ( { model | learnCanvas = { canvas | expandedCard = Nothing } }
            , Cmd.none
            )

        LearnStartDrag cardId mx my ->
            let
                canvas =
                    model.learnCanvas
            in
            ( { model
                | learnCanvas =
                    { canvas
                        | dragTarget = Just cardId
                        , dragStart = Just (Vec2 mx my)
                    }
              }
            , Cmd.none
            )

        LearnDrag mx my ->
            let
                canvas =
                    model.learnCanvas
            in
            case canvas.dragTarget of
                Just cardId ->
                    case canvas.dragStart of
                        Just start ->
                            let
                                dx =
                                    (mx - start.x) / canvas.zoom

                                dy =
                                    (my - start.y) / canvas.zoom

                                key =
                                    cardIdToString cardId

                                existing =
                                    List.filter (\( k, _ ) -> k == key) canvas.cardPositions
                                        |> List.head
                                        |> Maybe.map Tuple.second
                                        |> Maybe.withDefault (Vec2 0 0)

                                newPos =
                                    Vec2 (existing.x + dx) (existing.y + dy)

                                newPositions =
                                    ( key, newPos )
                                        :: List.filter (\( k, _ ) -> k /= key) canvas.cardPositions
                            in
                            ( { model
                                | learnCanvas =
                                    { canvas
                                        | cardPositions = newPositions
                                        , dragStart = Just (Vec2 mx my)
                                    }
                              }
                            , Cmd.none
                            )

                        Nothing ->
                            ( model, Cmd.none )

                Nothing ->
                    if canvas.isPanning then
                        case canvas.panStart of
                            Just start ->
                                let
                                    dx =
                                        mx - start.x

                                    dy =
                                        my - start.y
                                in
                                ( { model
                                    | learnCanvas =
                                        { canvas
                                            | panX = canvas.panX + dx
                                            , panY = canvas.panY + dy
                                            , panStart = Just (Vec2 mx my)
                                        }
                                  }
                                , Cmd.none
                                )

                            Nothing ->
                                ( model, Cmd.none )

                    else
                        ( model, Cmd.none )

        LearnEndDrag ->
            let
                canvas =
                    model.learnCanvas
            in
            ( { model
                | learnCanvas =
                    { canvas
                        | dragTarget = Nothing
                        , dragStart = Nothing
                        , isPanning = False
                        , panStart = Nothing
                    }
              }
            , Cmd.none
            )

        LearnStartPan mx my ->
            let
                canvas =
                    model.learnCanvas
            in
            ( { model
                | learnCanvas =
                    { canvas
                        | isPanning = True
                        , panStart = Just (Vec2 mx my)
                    }
              }
            , Cmd.none
            )

        LearnPan mx my ->
            let
                canvas =
                    model.learnCanvas
            in
            case canvas.panStart of
                Just start ->
                    let
                        dx =
                            mx - start.x

                        dy =
                            my - start.y
                    in
                    ( { model
                        | learnCanvas =
                            { canvas
                                | panX = canvas.panX + dx
                                , panY = canvas.panY + dy
                                , panStart = Just (Vec2 mx my)
                            }
                      }
                    , Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        LearnEndPan ->
            let
                canvas =
                    model.learnCanvas
            in
            ( { model
                | learnCanvas =
                    { canvas
                        | isPanning = False
                        , panStart = Nothing
                    }
              }
            , Cmd.none
            )

        LearnZoom delta ->
            let
                canvas =
                    model.learnCanvas

                newZoom =
                    clamp 0.5 3.0 (canvas.zoom + delta * 0.001)
            in
            ( { model | learnCanvas = { canvas | zoom = newZoom } }
            , Cmd.none
            )


cardIdToString : CardId -> String
cardIdToString cardId =
    case cardId of
        BrowserCard ->
            "browser"

        ServerCard ->
            "server"

        SdkCard ->
            "sdk"

        FormCard ->
            "form"

        ClientCard ->
            "client"

        AuthServerCard ->
            "authserver"

        TokenCard ->
            "token"

        ResultCard ->
            "result"

        ParCard ->
            "par"

        CallbacksCard ->
            "callbacks"
