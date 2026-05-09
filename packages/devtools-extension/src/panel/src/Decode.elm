module Decode exposing (decodeAuthEvent, decodeDiagnosisResult, decodeImportMeta, decodeSnapshotMeta)

import Json.Decode as JD
import Json.Decode.Pipeline exposing (hardcoded, optional, required)
import Types
    exposing
        ( AuthEvent
        , DiagnosisResult
        , EventData(..)
        , EventIssue
        , EventKind(..)
        , EventSource(..)
        , FlowHealth(..)
        , FlowIssue
        , ImportMeta
        , JourneyData
        , NetworkData
        , NodeData
        , NodeStatus(..)
        , OidcData
        , SdkAuthorization
        , SdkError
        , SessionData
        , Severity(..)
        , SnapshotMeta
        )


decodeSeverity : JD.Decoder Severity
decodeSeverity =
    JD.string
        |> JD.andThen
            (\s ->
                case s of
                    "error" ->
                        JD.succeed SevError

                    "warning" ->
                        JD.succeed SevWarning

                    _ ->
                        JD.succeed SevInfo
            )


decodeNodeStatus : JD.Decoder NodeStatus
decodeNodeStatus =
    JD.string
        |> JD.andThen
            (\s ->
                case s of
                    "continue" ->
                        JD.succeed Continue

                    "success" ->
                        JD.succeed Success

                    "error" ->
                        JD.succeed StatusError

                    "failure" ->
                        JD.succeed Failure

                    _ ->
                        JD.succeed UnknownStatus
            )


decodeEventKind : String -> String -> EventKind
decodeEventKind eventTypeStr sourceStr =
    case eventTypeStr of
        "sdk:node-change" ->
            NodeChange

        "sdk:journey-step" ->
            JourneyStep

        "sdk:oidc-state" ->
            OidcState

        "sdk:config" ->
            SdkConfig

        _ ->
            if sourceStr == "session" then
                SessionEvent

            else if sourceStr == "network" then
                NetworkEvent

            else
                OtherKind eventTypeStr


decodeEventSource : String -> EventSource
decodeEventSource sourceStr =
    case sourceStr of
        "network" ->
            NetworkSource

        "sdk" ->
            SdkSource

        "session" ->
            SessionSource

        _ ->
            OtherSource sourceStr


decodeSdkError : JD.Decoder SdkError
decodeSdkError =
    JD.succeed SdkError
        |> required "code" JD.string
        |> required "message" JD.string
        |> required "type" JD.string
        |> optional "internalHttpStatus" (JD.nullable JD.int) Nothing


decodeSdkAuthorization : JD.Decoder SdkAuthorization
decodeSdkAuthorization =
    JD.succeed SdkAuthorization
        |> optional "code" (JD.nullable JD.string) Nothing
        |> optional "state" (JD.nullable JD.string) Nothing


decodeNetworkData : JD.Decoder NetworkData
decodeNetworkData =
    JD.succeed NetworkData
        |> optional "status" (JD.nullable JD.int) Nothing
        |> optional "url" (JD.nullable JD.string) Nothing
        |> optional "method" (JD.nullable JD.string) Nothing
        |> optional "duration" (JD.nullable JD.float) Nothing
        |> optional "requestHeaders" (JD.nullable JD.value) Nothing
        |> optional "responseHeaders" (JD.nullable JD.value) Nothing
        |> optional "requestBody" (JD.nullable JD.value) Nothing
        |> optional "responseBody" (JD.nullable JD.value) Nothing


decodeNodeData : JD.Decoder NodeData
decodeNodeData =
    JD.succeed NodeData
        |> optional "nodeStatus" (JD.nullable decodeNodeStatus) Nothing
        |> optional "previousStatus" (JD.nullable decodeNodeStatus) Nothing
        |> optional "interactionId" (JD.nullable JD.string) Nothing
        |> optional "interactionToken" (JD.nullable JD.string) Nothing
        |> optional "nodeId" (JD.nullable JD.string) Nothing
        |> optional "requestId" (JD.nullable JD.string) Nothing
        |> optional "nodeName" (JD.nullable JD.string) Nothing
        |> optional "nodeDescription" (JD.nullable JD.string) Nothing
        |> optional "eventName" (JD.nullable JD.string) Nothing
        |> optional "httpStatus" (JD.nullable JD.int) Nothing
        |> optional "error" (JD.nullable decodeSdkError) Nothing
        |> optional "authorization" (JD.nullable decodeSdkAuthorization) Nothing
        |> optional "session" (JD.nullable JD.string) Nothing
        |> optional "collectors" (JD.nullable (JD.list JD.value)) Nothing
        |> optional "responseBody" (JD.nullable JD.value) Nothing


decodeJourneyData : JD.Decoder JourneyData
decodeJourneyData =
    JD.succeed JourneyData
        |> optional "stepType" (JD.nullable JD.string) Nothing
        |> optional "stage" (JD.nullable JD.string) Nothing
        |> optional "header" (JD.nullable JD.string) Nothing
        |> optional "description" (JD.nullable JD.string) Nothing
        |> optional "callbacks" (JD.nullable (JD.list JD.value)) Nothing
        |> optional "authId" (JD.nullable JD.string) Nothing
        |> optional "tokenId" (JD.nullable JD.string) Nothing
        |> optional "successUrl" (JD.nullable JD.string) Nothing
        |> optional "errorCode" (JD.nullable JD.int) Nothing
        |> optional "errorMessage" (JD.nullable JD.string) Nothing
        |> optional "errorReason" (JD.nullable JD.string) Nothing


decodeOidcData : JD.Decoder OidcData
decodeOidcData =
    JD.succeed OidcData
        |> optional "phase" (JD.nullable JD.string) Nothing
        |> optional "status" (JD.nullable JD.string) Nothing
        |> optional "clientId" (JD.nullable JD.string) Nothing
        |> optional "errorCode" (JD.nullable JD.string) Nothing
        |> optional "errorMessage" (JD.nullable JD.string) Nothing


decodeSessionData : JD.Decoder SessionData
decodeSessionData =
    JD.succeed SessionData
        |> optional "key" (JD.nullable JD.string) Nothing
        |> optional "before" (JD.nullable JD.string) Nothing
        |> optional "after" (JD.nullable JD.string) Nothing


decodeEventData : EventKind -> JD.Decoder EventData
decodeEventData kind =
    case kind of
        NodeChange ->
            JD.field "data" (JD.map DaVinciNode decodeNodeData)

        JourneyStep ->
            JD.field "data" (JD.map Journey decodeJourneyData)

        OidcState ->
            JD.field "data" (JD.map Oidc decodeOidcData)

        SdkConfig ->
            JD.map Config (JD.maybe (JD.at [ "data", "config" ] JD.value))

        SessionEvent ->
            JD.field "data" (JD.map Session decodeSessionData)

        NetworkEvent ->
            JD.field "data" (JD.map Network decodeNetworkData)

        OtherKind _ ->
            JD.field "data" (JD.map Network decodeNetworkData)


decodeAuthEvent : JD.Decoder AuthEvent
decodeAuthEvent =
    JD.field "type" JD.string
        |> JD.andThen
            (\eventTypeStr ->
                JD.field "source" JD.string
                    |> JD.andThen
                        (\sourceStr ->
                            let
                                kind =
                                    decodeEventKind eventTypeStr sourceStr

                                source =
                                    decodeEventSource sourceStr
                            in
                            JD.succeed AuthEvent
                                |> required "id" JD.string
                                |> required "timestamp" JD.float
                                |> hardcoded kind
                                |> hardcoded source
                                |> required "flowId" (JD.nullable JD.string)
                                |> Json.Decode.Pipeline.custom (JD.at [ "flags", "isCors" ] JD.bool)
                                |> Json.Decode.Pipeline.custom (JD.at [ "flags", "isError" ] JD.bool)
                                |> Json.Decode.Pipeline.custom (JD.at [ "flags", "isAuthRelated" ] JD.bool)
                                |> required "causedBy" (JD.nullable JD.string)
                                |> Json.Decode.Pipeline.custom (decodeEventData kind)
                        )
            )


decodeRelevantData : JD.Decoder (Maybe (List ( String, String )))
decodeRelevantData =
    JD.maybe
        (JD.field "relevantData"
            (JD.keyValuePairs JD.string)
        )


decodeEventIssue : JD.Decoder EventIssue
decodeEventIssue =
    JD.succeed EventIssue
        |> required "severity" decodeSeverity
        |> required "title" JD.string
        |> required "description" JD.string
        |> required "steps" (JD.list JD.string)
        |> Json.Decode.Pipeline.custom decodeRelevantData


decodeFlowIssue : JD.Decoder FlowIssue
decodeFlowIssue =
    JD.succeed FlowIssue
        |> required "id" JD.string
        |> required "severity" decodeSeverity
        |> required "category" JD.string
        |> required "title" JD.string
        |> required "description" JD.string
        |> required "steps" (JD.list JD.string)
        |> required "relatedEventIds" (JD.list JD.string)
        |> Json.Decode.Pipeline.custom decodeRelevantData


decodeFlowHealth : JD.Decoder FlowHealth
decodeFlowHealth =
    JD.string
        |> JD.andThen
            (\s ->
                case s of
                    "error" ->
                        JD.succeed Error

                    "warning" ->
                        JD.succeed Warning

                    _ ->
                        JD.succeed Healthy
            )


decodeDiagnosisResult : JD.Decoder DiagnosisResult
decodeDiagnosisResult =
    JD.succeed DiagnosisResult
        |> required "flowHealth" decodeFlowHealth
        |> required "issues" (JD.list decodeFlowIssue)
        |> required "annotatedEvents" (JD.keyValuePairs (JD.list decodeEventIssue))


decodeImportMeta : JD.Decoder ImportMeta
decodeImportMeta =
    JD.succeed ImportMeta
        |> required "flowId" (JD.nullable JD.string)
        |> required "capturedAt" JD.string
        |> required "redacted" JD.bool


decodeSnapshotMeta : JD.Decoder SnapshotMeta
decodeSnapshotMeta =
    JD.succeed SnapshotMeta
        |> required "id" JD.string
        |> required "savedAt" JD.string
        |> required "flowId" (JD.nullable JD.string)
        |> required "eventCount" JD.int
