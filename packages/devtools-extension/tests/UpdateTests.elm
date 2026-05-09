module UpdateTests exposing (suite)

import Dict
import Expect
import Model exposing (Model, init)
import Set
import Test exposing (Test, describe, test)
import Types exposing (AuthEvent, CardId(..), DiagnosisResult, EventData(..), EventKind(..), EventSource(..), FlowHealth(..), ImportMeta, InspectorTab(..), NetworkData, NodeData, NodeStatus(..), SnapshotMeta, ViewMode(..))
import Update exposing (Msg(..), update)


initModel : Model
initModel =
    Tuple.first (init ())


makeSdkEvent : String -> Float -> AuthEvent
makeSdkEvent id ts =
    { id = id
    , timestamp = ts
    , kind = NodeChange
    , source = SdkSource
    , flowId = Just "flow-1"
    , isCors = False
    , isError = False
    , isAuthRelated = True
    , causedBy = Nothing
    , data = DaVinciNode (NodeData (Just Continue) Nothing Nothing Nothing Nothing Nothing (Just "Username") Nothing Nothing Nothing Nothing Nothing Nothing Nothing Nothing)
    , oidcSemantics = Nothing
    }


makeNetworkEvent : String -> AuthEvent
makeNetworkEvent id =
    { id = id
    , timestamp = 100
    , kind = NetworkEvent
    , source = NetworkSource
    , flowId = Nothing
    , isCors = False
    , isError = False
    , isAuthRelated = True
    , causedBy = Nothing
    , data = Network (NetworkData (Just 200) (Just "https://x.com") (Just "GET") (Just 50) Nothing Nothing Nothing Nothing)
    , oidcSemantics = Nothing
    }


suite : Test
suite =
    describe "Update"
        [ eventReceivedTests
        , selectEventTests
        , selectEventTabTests
        , toggleTests
        , clearFlowTests
        , diagnosisTests
        , playbackTests
        , startPlaybackEdgeTests
        , snapshotTests
        , viewModeTests
        , importTests
        , flowNodeTests
        , learnSelectTests
        , learnDragTests
        , learnZoomTests
        ]


eventReceivedTests : Test
eventReceivedTests =
    describe "EventReceived"
        [ test "appends event to events list" <|
            \_ ->
                let
                    event =
                        makeSdkEvent "e1" 100

                    ( model, _ ) =
                        update (EventReceived event) initModel
                in
                Expect.equal 1 (List.length model.events)
        , test "inserts event into eventsById" <|
            \_ ->
                let
                    event =
                        makeSdkEvent "e1" 100

                    ( model, _ ) =
                        update (EventReceived event) initModel
                in
                Expect.equal (Just event) (Dict.get "e1" model.eventsById)
        , test "sets flowId from first event" <|
            \_ ->
                let
                    event =
                        makeSdkEvent "e1" 100

                    ( model, _ ) =
                        update (EventReceived event) initModel
                in
                Expect.equal (Just "flow-1") model.flowId
        , test "does not overwrite existing flowId" <|
            \_ ->
                let
                    modelWithFlow =
                        { initModel | flowId = Just "existing-flow" }

                    event =
                        makeSdkEvent "e1" 100

                    ( model, _ ) =
                        update (EventReceived event) modelWithFlow
                in
                Expect.equal (Just "existing-flow") model.flowId
        , test "ignores events when importedFlow is set" <|
            \_ ->
                let
                    importedModel =
                        { initModel | importedFlow = Just (ImportMeta (Just "flow-1") "2026-01-01" True) }

                    event =
                        makeSdkEvent "e1" 100

                    ( model, _ ) =
                        update (EventReceived event) importedModel
                in
                Expect.equal 0 (List.length model.events)
        ]


selectEventTests : Test
selectEventTests =
    describe "SelectEvent"
        [ test "sets selectedEventId" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (SelectEvent "e1") initModel
                in
                Expect.equal (Just "e1") model.selectedEventId
        , test "switches from CollectorsTab to HeadersTab for non-NodeChange" <|
            \_ ->
                let
                    event =
                        makeNetworkEvent "e1"

                    modelWithCollectors =
                        { initModel
                            | activeTab = CollectorsTab
                            , eventsById = Dict.singleton "e1" event
                        }

                    ( model, _ ) =
                        update (SelectEvent "e1") modelWithCollectors
                in
                Expect.equal HeadersTab model.activeTab
        , test "keeps CollectorsTab for NodeChange event" <|
            \_ ->
                let
                    event =
                        makeSdkEvent "e1" 100

                    modelWithCollectors =
                        { initModel
                            | activeTab = CollectorsTab
                            , eventsById = Dict.singleton "e1" event
                        }

                    ( model, _ ) =
                        update (SelectEvent "e1") modelWithCollectors
                in
                Expect.equal CollectorsTab model.activeTab
        , test "switches from SessionTab to HeadersTab for non-session event" <|
            \_ ->
                let
                    event =
                        makeNetworkEvent "e1"

                    modelWithSession =
                        { initModel
                            | activeTab = SessionTab
                            , eventsById = Dict.singleton "e1" event
                        }

                    ( model, _ ) =
                        update (SelectEvent "e1") modelWithSession
                in
                Expect.equal HeadersTab model.activeTab
        ]


toggleTests : Test
toggleTests =
    describe "Toggle actions"
        [ test "ToggleRecording flips recording flag" <|
            \_ ->
                let
                    ( model, _ ) =
                        update ToggleRecording initModel
                in
                Expect.equal False model.recording
        , test "ToggleExportMenu flips export menu" <|
            \_ ->
                let
                    ( model, _ ) =
                        update ToggleExportMenu initModel
                in
                Expect.equal True model.exportMenuOpen
        , test "CloseExportMenu closes export menu" <|
            \_ ->
                let
                    ( model, _ ) =
                        update CloseExportMenu { initModel | exportMenuOpen = True }
                in
                Expect.equal False model.exportMenuOpen
        , test "ToggleSummary flips summaryCollapsed" <|
            \_ ->
                let
                    ( model, _ ) =
                        update ToggleSummary initModel
                in
                Expect.equal True model.summaryCollapsed
        , test "SwitchTab changes active tab" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (SwitchTab CorsTab) initModel
                in
                Expect.equal CorsTab model.activeTab
        ]


clearFlowTests : Test
clearFlowTests =
    describe "ClearFlow"
        [ test "resets all model state" <|
            \_ ->
                let
                    dirtyModel =
                        { initModel
                            | events = [ makeSdkEvent "e1" 100 ]
                            , selectedEventId = Just "e1"
                            , flowId = Just "flow-1"
                            , isPlaying = True
                            , exportMenuOpen = True
                        }

                    ( model, _ ) =
                        update ClearFlow dirtyModel
                in
                Expect.all
                    [ \m -> Expect.equal [] m.events
                    , \m -> Expect.equal Nothing m.selectedEventId
                    , \m -> Expect.equal Nothing m.flowId
                    , \m -> Expect.equal False m.isPlaying
                    , \m -> Expect.equal False m.exportMenuOpen
                    , \m -> Expect.equal True m.recording
                    , \m -> Expect.equal Dict.empty m.eventsById
                    ]
                    model
        ]


diagnosisTests : Test
diagnosisTests =
    describe "DiagnosisReceived"
        [ test "stores diagnosis result" <|
            \_ ->
                let
                    diag =
                        DiagnosisResult Healthy [] []

                    ( model, _ ) =
                        update (DiagnosisReceived diag) initModel
                in
                Expect.equal (Just diag) model.diagnosis
        , test "auto-expands summary on error when recording and collapsed" <|
            \_ ->
                let
                    diag =
                        DiagnosisResult Error [] []

                    collapsedModel =
                        { initModel | summaryCollapsed = True, recording = True }

                    ( model, _ ) =
                        update (DiagnosisReceived diag) collapsedModel
                in
                Expect.equal False model.summaryCollapsed
        , test "does not auto-expand when not recording" <|
            \_ ->
                let
                    diag =
                        DiagnosisResult Error [] []

                    notRecording =
                        { initModel | summaryCollapsed = True, recording = False }

                    ( model, _ ) =
                        update (DiagnosisReceived diag) notRecording
                in
                Expect.equal True model.summaryCollapsed
        , test "does not auto-expand for healthy diagnosis" <|
            \_ ->
                let
                    diag =
                        DiagnosisResult Healthy [] []

                    collapsedModel =
                        { initModel | summaryCollapsed = True, recording = True }

                    ( model, _ ) =
                        update (DiagnosisReceived diag) collapsedModel
                in
                Expect.equal True model.summaryCollapsed
        ]


playbackTests : Test
playbackTests =
    describe "Playback"
        [ test "StartPlayback sets isPlaying and playbackIndex" <|
            \_ ->
                let
                    modelWithEvents =
                        { initModel | events = [ makeSdkEvent "s1" 100, makeSdkEvent "s2" 200 ] }

                    ( model, _ ) =
                        update StartPlayback modelWithEvents
                in
                Expect.all
                    [ \m -> Expect.equal True m.isPlaying
                    , \m -> Expect.equal (Just 0) m.playbackIndex
                    , \m -> Expect.equal (Just "s1") m.selectedNodeId
                    ]
                    model
        , test "StopPlayback stops playing" <|
            \_ ->
                let
                    ( model, _ ) =
                        update StopPlayback { initModel | isPlaying = True }
                in
                Expect.equal False model.isPlaying
        , test "PlaybackTick advances to next node" <|
            \_ ->
                let
                    modelPlaying =
                        { initModel
                            | events = [ makeSdkEvent "s1" 100, makeSdkEvent "s2" 200 ]
                            , isPlaying = True
                            , playbackIndex = Just 0
                        }

                    ( model, _ ) =
                        update PlaybackTick modelPlaying
                in
                Expect.all
                    [ \m -> Expect.equal (Just 1) m.playbackIndex
                    , \m -> Expect.equal (Just "s2") m.selectedNodeId
                    ]
                    model
        , test "PlaybackTick stops at end of nodes" <|
            \_ ->
                let
                    modelAtEnd =
                        { initModel
                            | events = [ makeSdkEvent "s1" 100 ]
                            , isPlaying = True
                            , playbackIndex = Just 0
                        }

                    ( model, _ ) =
                        update PlaybackTick modelAtEnd
                in
                Expect.all
                    [ \m -> Expect.equal False m.isPlaying
                    , \m -> Expect.equal Nothing m.playbackIndex
                    ]
                    model
        , test "PlaybackTick is no-op when not playing" <|
            \_ ->
                let
                    ( model, _ ) =
                        update PlaybackTick initModel
                in
                Expect.equal initModel model
        , test "ResetPlayback clears playback state" <|
            \_ ->
                let
                    playing =
                        { initModel | isPlaying = True, playbackIndex = Just 2, selectedNodeId = Just "s3" }

                    ( model, _ ) =
                        update ResetPlayback playing
                in
                Expect.all
                    [ \m -> Expect.equal False m.isPlaying
                    , \m -> Expect.equal Nothing m.playbackIndex
                    , \m -> Expect.equal Nothing m.selectedNodeId
                    ]
                    model
        ]


snapshotTests : Test
snapshotTests =
    describe "Snapshots"
        [ test "SnapshotsReceived stores snapshots" <|
            \_ ->
                let
                    snaps =
                        [ SnapshotMeta "s1" "2026-01-01" (Just "f1") 5 ]

                    ( model, _ ) =
                        update (SnapshotsReceived snaps) initModel
                in
                Expect.equal snaps model.snapshots
        , test "DeleteSnapshot removes by id" <|
            \_ ->
                let
                    snaps =
                        [ SnapshotMeta "s1" "2026-01-01" Nothing 3
                        , SnapshotMeta "s2" "2026-01-02" Nothing 5
                        ]

                    modelWithSnaps =
                        { initModel | snapshots = snaps }

                    ( model, _ ) =
                        update (DeleteSnapshot "s1") modelWithSnaps
                in
                Expect.equal [ SnapshotMeta "s2" "2026-01-02" Nothing 5 ] model.snapshots
        , test "ToggleSnapshotMenu flips snapshot menu" <|
            \_ ->
                let
                    ( model, _ ) =
                        update ToggleSnapshotMenu initModel
                in
                Expect.equal True model.snapshotMenuOpen
        , test "CloseSnapshotMenu closes snapshot menu" <|
            \_ ->
                let
                    ( model, _ ) =
                        update CloseSnapshotMenu { initModel | snapshotMenuOpen = True }
                in
                Expect.equal False model.snapshotMenuOpen
        ]


viewModeTests : Test
viewModeTests =
    describe "SwitchViewMode"
        [ test "switches to FlowMode and resets playback" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (SwitchViewMode FlowMode) { initModel | isPlaying = True, playbackIndex = Just 2 }
                in
                Expect.all
                    [ \m -> Expect.equal FlowMode m.viewMode
                    , \m -> Expect.equal False m.isPlaying
                    , \m -> Expect.equal Nothing m.playbackIndex
                    , \m -> Expect.equal Nothing m.selectedNodeId
                    ]
                    model
        ]


importTests : Test
importTests =
    describe "Import"
        [ test "ImportFlow opens paste dialog and clears error" <|
            \_ ->
                let
                    ( model, _ ) =
                        update ImportFlow { initModel | lastDecodeError = Just "old error" }
                in
                Expect.all
                    [ \m -> Expect.equal True m.importPasteOpen
                    , \m -> Expect.equal "" m.importPasteText
                    , \m -> Expect.equal Nothing m.lastDecodeError
                    ]
                    model
        , test "UpdateImportPaste stores text" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (UpdateImportPaste "some json") { initModel | importPasteOpen = True }
                in
                Expect.equal "some json" model.importPasteText
        , test "SubmitImportPaste closes dialog and clears text" <|
            \_ ->
                let
                    ( model, _ ) =
                        update SubmitImportPaste { initModel | importPasteOpen = True, importPasteText = "data" }
                in
                Expect.all
                    [ \m -> Expect.equal False m.importPasteOpen
                    , \m -> Expect.equal "" m.importPasteText
                    ]
                    model
        , test "CancelImportPaste closes dialog and clears text" <|
            \_ ->
                let
                    ( model, _ ) =
                        update CancelImportPaste { initModel | importPasteOpen = True, importPasteText = "data" }
                in
                Expect.all
                    [ \m -> Expect.equal False m.importPasteOpen
                    , \m -> Expect.equal "" m.importPasteText
                    ]
                    model
        , test "ImportMetaReceived stores meta and stops recording" <|
            \_ ->
                let
                    meta =
                        ImportMeta (Just "flow-1") "2026-01-01" True

                    ( model, _ ) =
                        update (ImportMetaReceived meta) initModel
                in
                Expect.all
                    [ \m -> Expect.equal (Just meta) m.importedFlow
                    , \m -> Expect.equal False m.recording
                    ]
                    model
        , test "ImportError stores error message" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (ImportError "Bad JSON") initModel
                in
                Expect.equal (Just "Bad JSON") model.lastDecodeError
        , test "DecodeError stores error message" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (DecodeError "Parse failed") initModel
                in
                Expect.equal (Just "Parse failed") model.lastDecodeError
        ]


flowNodeTests : Test
flowNodeTests =
    describe "Flow node interactions"
        [ test "SelectFlowNode sets selectedNodeId and clears sub-rows" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (SelectFlowNode "node-1") { initModel | expandedSubRows = Set.fromList [ "row-1" ] }
                in
                Expect.all
                    [ \m -> Expect.equal (Just "node-1") m.selectedNodeId
                    , \m -> Expect.equal Set.empty m.expandedSubRows
                    ]
                    model
        , test "ToggleSubRow adds key to expanded set" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (ToggleSubRow "row-1") initModel
                in
                Expect.equal True (Set.member "row-1" model.expandedSubRows)
        , test "ToggleSubRow removes key if already expanded" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (ToggleSubRow "row-1") { initModel | expandedSubRows = Set.singleton "row-1" }
                in
                Expect.equal False (Set.member "row-1" model.expandedSubRows)
        , test "HoverNode sets hoveredNodeId" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (HoverNode (Just "n1")) initModel
                in
                Expect.equal (Just "n1") model.hoveredNodeId
        , test "HoverNode clears hoveredNodeId" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (HoverNode Nothing) { initModel | hoveredNodeId = Just "n1" }
                in
                Expect.equal Nothing model.hoveredNodeId
        , test "CopyToClipboard is a no-op on model" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (CopyToClipboard "some text") initModel
                in
                Expect.equal initModel model
        , test "SelectNode sets selectedEventId and switches to SdkStateTab" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (SelectNode "e1") initModel
                in
                Expect.all
                    [ \m -> Expect.equal (Just "e1") m.selectedEventId
                    , \m -> Expect.equal SdkStateTab m.activeTab
                    ]
                    model
        , test "ExportJson closes export menu" <|
            \_ ->
                let
                    ( model, _ ) =
                        update ExportJson { initModel | exportMenuOpen = True }
                in
                Expect.equal False model.exportMenuOpen
        , test "ExportMarkdown closes export menu" <|
            \_ ->
                let
                    ( model, _ ) =
                        update ExportMarkdown { initModel | exportMenuOpen = True }
                in
                Expect.equal False model.exportMenuOpen
        , test "SaveSnapshot is a no-op on model" <|
            \_ ->
                let
                    ( model, _ ) =
                        update SaveSnapshot initModel
                in
                Expect.equal initModel model
        , test "LoadSnapshot closes snapshot menu" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (LoadSnapshot "snap-1") { initModel | snapshotMenuOpen = True }
                in
                Expect.equal False model.snapshotMenuOpen
        ]


selectEventTabTests : Test
selectEventTabTests =
    describe "SelectEvent tab switching"
        [ test "switches from ConfigTab to HeadersTab for non-config event" <|
            \_ ->
                let
                    event =
                        makeNetworkEvent "e1"

                    modelWithConfig =
                        { initModel
                            | activeTab = ConfigTab
                            , eventsById = Dict.singleton "e1" event
                        }

                    ( model, _ ) =
                        update (SelectEvent "e1") modelWithConfig
                in
                Expect.equal HeadersTab model.activeTab
        , test "keeps ConfigTab for sdk:config event" <|
            \_ ->
                let
                    configEvent =
                        { id = "e1"
                        , timestamp = 100
                        , kind = SdkConfig
                        , source = SdkSource
                        , flowId = Nothing
                        , isCors = False
                        , isError = False
                        , isAuthRelated = True
                        , causedBy = Nothing
                        , data = Config Nothing
                        , oidcSemantics = Nothing
                        }

                    modelWithConfig =
                        { initModel
                            | activeTab = ConfigTab
                            , eventsById = Dict.singleton "e1" configEvent
                        }

                    ( model, _ ) =
                        update (SelectEvent "e1") modelWithConfig
                in
                Expect.equal ConfigTab model.activeTab
        , test "keeps HeadersTab for any event" <|
            \_ ->
                let
                    event =
                        makeNetworkEvent "e1"

                    modelWithHeaders =
                        { initModel
                            | activeTab = HeadersTab
                            , eventsById = Dict.singleton "e1" event
                        }

                    ( model, _ ) =
                        update (SelectEvent "e1") modelWithHeaders
                in
                Expect.equal HeadersTab model.activeTab
        ]


startPlaybackEdgeTests : Test
startPlaybackEdgeTests =
    describe "StartPlayback edge cases"
        [ test "resets to 0 when at end of nodes" <|
            \_ ->
                let
                    modelAtEnd =
                        { initModel
                            | events = [ makeSdkEvent "s1" 100, makeSdkEvent "s2" 200 ]
                            , playbackIndex = Just 1
                        }

                    ( model, _ ) =
                        update StartPlayback modelAtEnd
                in
                Expect.all
                    [ \m -> Expect.equal (Just 0) m.playbackIndex
                    , \m -> Expect.equal (Just "s1") m.selectedNodeId
                    ]
                    model
        , test "resumes from current index when not at end" <|
            \_ ->
                let
                    modelMidway =
                        { initModel
                            | events = [ makeSdkEvent "s1" 100, makeSdkEvent "s2" 200, makeSdkEvent "s3" 300 ]
                            , playbackIndex = Just 1
                        }

                    ( model, _ ) =
                        update StartPlayback modelMidway
                in
                Expect.all
                    [ \m -> Expect.equal (Just 1) m.playbackIndex
                    , \m -> Expect.equal (Just "s2") m.selectedNodeId
                    ]
                    model
        ]


learnSelectTests : Test
learnSelectTests =
    describe "Learn select interactions"
        [ test "LearnSelectNode sets learnSelectedNodeId and clears expandedCard and cardPositions" <|
            \_ ->
                let
                    canvas =
                        initModel.learnCanvas

                    modelWithCard =
                        { initModel
                            | learnCanvas =
                                { canvas
                                    | expandedCard = Just BrowserCard
                                    , cardPositions = [ ( "browser", { x = 10, y = 20 } ) ]
                                }
                        }

                    ( model, _ ) =
                        update (LearnSelectNode "node-1") modelWithCard
                in
                Expect.all
                    [ \m -> Expect.equal (Just "node-1") m.learnCanvas.learnSelectedNodeId
                    , \m -> Expect.equal Nothing m.learnCanvas.expandedCard
                    , \m -> Expect.equal [] m.learnCanvas.cardPositions
                    ]
                    model
        , test "LearnExpandCard sets expandedCard" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (LearnExpandCard BrowserCard) initModel
                in
                Expect.equal (Just BrowserCard) model.learnCanvas.expandedCard
        , test "LearnExpandCard toggles off when same card" <|
            \_ ->
                let
                    canvas =
                        initModel.learnCanvas

                    modelWithExpanded =
                        { initModel | learnCanvas = { canvas | expandedCard = Just BrowserCard } }

                    ( model, _ ) =
                        update (LearnExpandCard BrowserCard) modelWithExpanded
                in
                Expect.equal Nothing model.learnCanvas.expandedCard
        , test "LearnExpandCard switches to different card" <|
            \_ ->
                let
                    canvas =
                        initModel.learnCanvas

                    modelWithExpanded =
                        { initModel | learnCanvas = { canvas | expandedCard = Just BrowserCard } }

                    ( model, _ ) =
                        update (LearnExpandCard ServerCard) modelWithExpanded
                in
                Expect.equal (Just ServerCard) model.learnCanvas.expandedCard
        , test "LearnCollapseCard clears expandedCard" <|
            \_ ->
                let
                    canvas =
                        initModel.learnCanvas

                    modelWithExpanded =
                        { initModel | learnCanvas = { canvas | expandedCard = Just SdkCard } }

                    ( model, _ ) =
                        update LearnCollapseCard modelWithExpanded
                in
                Expect.equal Nothing model.learnCanvas.expandedCard
        ]


learnDragTests : Test
learnDragTests =
    describe "Learn drag and pan interactions"
        [ test "LearnStartDrag sets dragTarget and dragStart" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (LearnStartDrag BrowserCard 100 200) initModel
                in
                Expect.all
                    [ \m -> Expect.equal (Just BrowserCard) m.learnCanvas.dragTarget
                    , \m -> Expect.equal (Just { x = 100, y = 200 }) m.learnCanvas.dragStart
                    ]
                    model
        , test "LearnEndDrag clears drag and pan state" <|
            \_ ->
                let
                    canvas =
                        initModel.learnCanvas

                    draggingModel =
                        { initModel
                            | learnCanvas =
                                { canvas
                                    | dragTarget = Just BrowserCard
                                    , dragStart = Just { x = 100, y = 200 }
                                    , isPanning = True
                                    , panStart = Just { x = 50, y = 60 }
                                }
                        }

                    ( model, _ ) =
                        update LearnEndDrag draggingModel
                in
                Expect.all
                    [ \m -> Expect.equal Nothing m.learnCanvas.dragTarget
                    , \m -> Expect.equal Nothing m.learnCanvas.dragStart
                    , \m -> Expect.equal False m.learnCanvas.isPanning
                    , \m -> Expect.equal Nothing m.learnCanvas.panStart
                    ]
                    model
        , test "LearnStartPan sets isPanning and panStart" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (LearnStartPan 300 400) initModel
                in
                Expect.all
                    [ \m -> Expect.equal True m.learnCanvas.isPanning
                    , \m -> Expect.equal (Just { x = 300, y = 400 }) m.learnCanvas.panStart
                    ]
                    model
        , test "LearnEndPan clears isPanning and panStart" <|
            \_ ->
                let
                    canvas =
                        initModel.learnCanvas

                    panningModel =
                        { initModel
                            | learnCanvas =
                                { canvas
                                    | isPanning = True
                                    , panStart = Just { x = 300, y = 400 }
                                }
                        }

                    ( model, _ ) =
                        update LearnEndPan panningModel
                in
                Expect.all
                    [ \m -> Expect.equal False m.learnCanvas.isPanning
                    , \m -> Expect.equal Nothing m.learnCanvas.panStart
                    ]
                    model
        ]


learnZoomTests : Test
learnZoomTests =
    describe "Learn zoom interactions"
        [ test "LearnZoom adjusts zoom level" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (LearnZoom 100) initModel
                in
                Expect.within (Expect.Absolute 0.001) 1.1 model.learnCanvas.zoom
        , test "LearnZoom clamps to minimum 0.5" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (LearnZoom -10000) initModel
                in
                Expect.within (Expect.Absolute 0.001) 0.5 model.learnCanvas.zoom
        , test "LearnZoom clamps to maximum 3.0" <|
            \_ ->
                let
                    ( model, _ ) =
                        update (LearnZoom 10000) initModel
                in
                Expect.within (Expect.Absolute 0.001) 3.0 model.learnCanvas.zoom
        ]
