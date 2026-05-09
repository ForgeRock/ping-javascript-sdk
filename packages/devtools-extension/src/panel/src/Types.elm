module Types exposing
    ( AuthEvent
    , CanvasState
    , CardId(..)
    , DiagnosisResult
    , EventData(..)
    , EventIssue
    , EventKind(..)
    , EventSource(..)
    , FlowHealth(..)
    , FlowIssue
    , ImportMeta
    , InspectorTab(..)
    , JourneyData
    , LearnLayout(..)
    , NetworkData
    , NodeData
    , NodeStatus(..)
    , OidcData
    , OidcSemanticData
    , SdkAuthorization
    , SdkError
    , SessionData
    , Severity(..)
    , SnapshotMeta
    , Vec2
    , ViewMode(..)
    )

import Json.Decode as Decode


type Severity
    = SevError
    | SevWarning
    | SevInfo


type NodeStatus
    = Continue
    | Success
    | StatusError
    | Failure
    | UnknownStatus


type EventKind
    = NodeChange
    | JourneyStep
    | OidcState
    | SdkConfig
    | NetworkEvent
    | SessionEvent
    | OtherKind String


type EventSource
    = NetworkSource
    | SdkSource
    | SessionSource
    | OtherSource String


type alias SdkError =
    { code : String
    , message : String
    , errorType : String
    , internalHttpStatus : Maybe Int
    }


type alias SdkAuthorization =
    { code : Maybe String
    , state : Maybe String
    }


type alias AuthEvent =
    { id : String
    , timestamp : Float
    , kind : EventKind
    , source : EventSource
    , flowId : Maybe String
    , isCors : Bool
    , isError : Bool
    , isAuthRelated : Bool
    , causedBy : Maybe String
    , data : EventData
    , oidcSemantics : Maybe OidcSemanticData
    }


type EventData
    = Network NetworkData
    | DaVinciNode NodeData
    | Journey JourneyData
    | Oidc OidcData
    | Session SessionData
    | Config (Maybe Decode.Value)


type alias NetworkData =
    { status : Maybe Int
    , url : Maybe String
    , method : Maybe String
    , duration : Maybe Float
    , requestHeaders : Maybe Decode.Value
    , responseHeaders : Maybe Decode.Value
    , requestBody : Maybe Decode.Value
    , responseBody : Maybe Decode.Value
    }


type alias NodeData =
    { nodeStatus : Maybe NodeStatus
    , previousStatus : Maybe NodeStatus
    , interactionId : Maybe String
    , interactionToken : Maybe String
    , nodeId : Maybe String
    , requestId : Maybe String
    , nodeName : Maybe String
    , nodeDescription : Maybe String
    , eventName : Maybe String
    , httpStatus : Maybe Int
    , sdkError : Maybe SdkError
    , authorization : Maybe SdkAuthorization
    , session : Maybe String
    , collectors : Maybe (List Decode.Value)
    , responseBody : Maybe Decode.Value
    }


type alias JourneyData =
    { stepType : Maybe String
    , stage : Maybe String
    , header : Maybe String
    , description : Maybe String
    , callbacks : Maybe (List Decode.Value)
    , authId : Maybe String
    , tokenId : Maybe String
    , successUrl : Maybe String
    , errorCode : Maybe Int
    , errorMessage : Maybe String
    , errorReason : Maybe String
    }


type alias OidcData =
    { phase : Maybe String
    , status : Maybe String
    , clientId : Maybe String
    , errorCode : Maybe String
    , errorMessage : Maybe String
    }


type alias SessionData =
    { key : Maybe String
    , before : Maybe String
    , after : Maybe String
    }


type alias OidcSemanticData =
    { oidcPhase : Maybe String
    , grantType : Maybe String
    , hasPkce : Bool
    , hasDpop : Bool
    , clientId : Maybe String
    , stateParam : Maybe String
    , hasTokens : Bool
    , tokenType : Maybe String
    , errorCode : Maybe String
    , errorDescription : Maybe String
    , parRequestUri : Maybe String
    }


type InspectorTab
    = DiagnosisTab
    | HeadersTab
    | CookiesTab
    | CorsTab
    | SdkStateTab
    | CollectorsTab
    | SessionTab
    | ConfigTab
    | OidcTab


type FlowHealth
    = Healthy
    | Warning
    | Error


type alias EventIssue =
    { severity : Severity
    , title : String
    , description : String
    , steps : List String
    , relevantData : Maybe (List ( String, String ))
    }


type alias FlowIssue =
    { id : String
    , severity : Severity
    , category : String
    , title : String
    , description : String
    , steps : List String
    , relatedEventIds : List String
    , relevantData : Maybe (List ( String, String ))
    }


type alias DiagnosisResult =
    { flowHealth : FlowHealth
    , issues : List FlowIssue
    , annotatedEvents : List ( String, List EventIssue )
    }


type CardId
    = BrowserCard
    | ServerCard
    | SdkCard
    | FormCard
    | ClientCard
    | AuthServerCard
    | TokenCard
    | ResultCard
    | ParCard
    | CallbacksCard


type LearnLayout
    = DaVinciLayout
    | JourneyLayout
    | OidcCodeLayout
    | OidcDpopLayout
    | OidcParLayout


type alias Vec2 =
    { x : Float, y : Float }


type alias CanvasState =
    { zoom : Float
    , panX : Float
    , panY : Float
    , cardPositions : List ( String, Vec2 )
    , expandedCard : Maybe CardId
    , dragTarget : Maybe CardId
    , dragStart : Maybe Vec2
    , isPanning : Bool
    , panStart : Maybe Vec2
    , learnSelectedNodeId : Maybe String
    }


type ViewMode
    = TimelineMode
    | FlowMode
    | LearnMode


type alias ImportMeta =
    { flowId : Maybe String
    , capturedAt : String
    , redacted : Bool
    }


type alias SnapshotMeta =
    { id : String
    , savedAt : String
    , flowId : Maybe String
    , eventCount : Int
    }
