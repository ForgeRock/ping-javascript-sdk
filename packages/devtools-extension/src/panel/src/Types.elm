module Types exposing
    ( AuthEvent
    , DiagnosisResult
    , EventData(..)
    , EventIssue
    , FlowHealth(..)
    , FlowIssue
    , ImportMeta
    , InspectorTab(..)
    , JourneyData
    , NetworkData
    , NodeData
    , OidcData
    , SdkAuthorization
    , SdkError
    , SessionData
    , SnapshotMeta
    , ViewMode(..)
    )

import Json.Decode as Decode


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
    , eventType : String
    , source : String
    , flowId : Maybe String
    , isCors : Bool
    , isError : Bool
    , isAuthRelated : Bool
    , causedBy : Maybe String
    , data : EventData
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
    { nodeStatus : Maybe String
    , previousStatus : Maybe String
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


type InspectorTab
    = DiagnosisTab
    | HeadersTab
    | CookiesTab
    | CorsTab
    | SdkStateTab
    | CollectorsTab
    | SessionTab
    | ConfigTab


type FlowHealth
    = Healthy
    | Warning
    | Error


type alias EventIssue =
    { severity : String
    , title : String
    , description : String
    , steps : List String
    , relevantData : Maybe (List ( String, String ))
    }


type alias FlowIssue =
    { id : String
    , severity : String
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


type ViewMode
    = TimelineMode
    | FlowMode


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
