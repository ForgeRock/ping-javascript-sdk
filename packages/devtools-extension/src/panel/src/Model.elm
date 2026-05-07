module Model exposing (Model, init)

import Dict exposing (Dict)
import Set exposing (Set)
import Types exposing (AuthEvent, DiagnosisResult, ImportMeta, InspectorTab(..), SnapshotMeta, ViewMode(..))


type alias Model =
    { events : List AuthEvent
    , eventsById : Dict String AuthEvent
    , selectedEventId : Maybe String
    , activeTab : InspectorTab
    , recording : Bool
    , flowId : Maybe String
    , lastDecodeError : Maybe String
    , diagnosis : Maybe DiagnosisResult
    , summaryCollapsed : Bool
    , viewMode : ViewMode
    , playbackIndex : Maybe Int
    , isPlaying : Bool
    , selectedNodeId : Maybe String
    , expandedSubRows : Set String
    , exportMenuOpen : Bool
    , importedFlow : Maybe ImportMeta
    , importPasteOpen : Bool
    , importPasteText : String
    , hoveredNodeId : Maybe String
    , snapshotMenuOpen : Bool
    , snapshots : List SnapshotMeta
    }


init : () -> ( Model, Cmd msg )
init _ =
    ( { events = []
      , eventsById = Dict.empty
      , selectedEventId = Nothing
      , activeTab = HeadersTab
      , recording = True
      , flowId = Nothing
      , lastDecodeError = Nothing
      , diagnosis = Nothing
      , summaryCollapsed = False
      , viewMode = TimelineMode
      , playbackIndex = Nothing
      , isPlaying = False
      , selectedNodeId = Nothing
      , expandedSubRows = Set.empty
      , exportMenuOpen = False
      , importedFlow = Nothing
      , importPasteOpen = False
      , importPasteText = ""
      , hoveredNodeId = Nothing
      , snapshotMenuOpen = False
      , snapshots = []
      }
    , Cmd.none
    )
