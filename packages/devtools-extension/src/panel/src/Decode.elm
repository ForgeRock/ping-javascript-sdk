module Decode exposing (decodeAuthEvent, decodeDiagnosisResult, decodeImportMeta, decodeSnapshotMeta)

import Json.Decode as JD
import Types
    exposing
        ( AuthEvent
        , DiagnosisResult
        , EventData(..)
        , EventIssue
        , FlowHealth(..)
        , FlowIssue
        , ImportMeta
        , JourneyData
        , NetworkData
        , NodeData
        , OidcData
        , SdkAuthorization
        , SdkError
        , SessionData
        , SnapshotMeta
        )


decodeSdkError : JD.Decoder SdkError
decodeSdkError =
    JD.map4 SdkError
        (JD.field "code" JD.string)
        (JD.field "message" JD.string)
        (JD.field "type" JD.string)
        (JD.maybe (JD.field "internalHttpStatus" JD.int))


decodeSdkAuthorization : JD.Decoder SdkAuthorization
decodeSdkAuthorization =
    JD.map2 SdkAuthorization
        (JD.maybe (JD.field "code" JD.string))
        (JD.maybe (JD.field "state" JD.string))


decodeNetworkData : JD.Decoder NetworkData
decodeNetworkData =
    JD.succeed NetworkData
        |> andMap (JD.maybe (JD.field "status" JD.int))
        |> andMap (JD.maybe (JD.field "url" JD.string))
        |> andMap (JD.maybe (JD.field "method" JD.string))
        |> andMap (JD.maybe (JD.field "duration" JD.float))
        |> andMap (JD.maybe (JD.field "requestHeaders" JD.value))
        |> andMap (JD.maybe (JD.field "responseHeaders" JD.value))
        |> andMap (JD.maybe (JD.field "requestBody" JD.value))
        |> andMap (JD.maybe (JD.field "responseBody" JD.value))


decodeNodeData : JD.Decoder NodeData
decodeNodeData =
    JD.succeed NodeData
        |> andMap (JD.maybe (JD.field "nodeStatus" JD.string))
        |> andMap (JD.maybe (JD.field "previousStatus" JD.string))
        |> andMap (JD.maybe (JD.field "interactionId" JD.string))
        |> andMap (JD.maybe (JD.field "interactionToken" JD.string))
        |> andMap (JD.maybe (JD.field "nodeId" JD.string))
        |> andMap (JD.maybe (JD.field "requestId" JD.string))
        |> andMap (JD.maybe (JD.field "nodeName" JD.string))
        |> andMap (JD.maybe (JD.field "nodeDescription" JD.string))
        |> andMap (JD.maybe (JD.field "eventName" JD.string))
        |> andMap (JD.maybe (JD.field "httpStatus" JD.int))
        |> andMap (JD.maybe (JD.field "error" decodeSdkError))
        |> andMap (JD.maybe (JD.field "authorization" decodeSdkAuthorization))
        |> andMap (JD.maybe (JD.field "session" JD.string))
        |> andMap (JD.maybe (JD.field "collectors" (JD.list JD.value)))
        |> andMap (JD.maybe (JD.field "responseBody" JD.value))


decodeJourneyData : JD.Decoder JourneyData
decodeJourneyData =
    JD.succeed JourneyData
        |> andMap (JD.maybe (JD.field "stepType" JD.string))
        |> andMap (JD.maybe (JD.field "stage" JD.string))
        |> andMap (JD.maybe (JD.field "header" JD.string))
        |> andMap (JD.maybe (JD.field "description" JD.string))
        |> andMap (JD.maybe (JD.field "callbacks" (JD.list JD.value)))
        |> andMap (JD.maybe (JD.field "authId" JD.string))
        |> andMap (JD.maybe (JD.field "tokenId" JD.string))
        |> andMap (JD.maybe (JD.field "successUrl" JD.string))
        |> andMap (JD.maybe (JD.field "errorCode" JD.int))
        |> andMap (JD.maybe (JD.field "errorMessage" JD.string))
        |> andMap (JD.maybe (JD.field "errorReason" JD.string))


decodeOidcData : JD.Decoder OidcData
decodeOidcData =
    JD.succeed OidcData
        |> andMap (JD.maybe (JD.field "phase" JD.string))
        |> andMap (JD.maybe (JD.field "status" JD.string))
        |> andMap (JD.maybe (JD.field "clientId" JD.string))
        |> andMap (JD.maybe (JD.field "errorCode" JD.string))
        |> andMap (JD.maybe (JD.field "errorMessage" JD.string))


decodeSessionData : JD.Decoder SessionData
decodeSessionData =
    JD.succeed SessionData
        |> andMap (JD.maybe (JD.field "key" JD.string))
        |> andMap (JD.maybe (JD.field "before" JD.string))
        |> andMap (JD.maybe (JD.field "after" JD.string))


decodeEventData : String -> String -> JD.Decoder EventData
decodeEventData eventTypeStr source =
    case eventTypeStr of
        "sdk:node-change" ->
            JD.field "data" (JD.map DaVinciNode decodeNodeData)

        "sdk:journey-step" ->
            JD.field "data" (JD.map Journey decodeJourneyData)

        "sdk:oidc-state" ->
            JD.field "data" (JD.map Oidc decodeOidcData)

        "sdk:config" ->
            JD.map Config (JD.maybe (JD.at [ "data", "config" ] JD.value))

        _ ->
            if source == "session" then
                JD.field "data" (JD.map Session decodeSessionData)

            else
                JD.field "data" (JD.map Network decodeNetworkData)


decodeAuthEvent : JD.Decoder AuthEvent
decodeAuthEvent =
    JD.field "type" JD.string
        |> JD.andThen
            (\eventTypeStr ->
                JD.field "source" JD.string
                    |> JD.andThen
                        (\source ->
                            JD.succeed AuthEvent
                                |> andMap (JD.field "id" JD.string)
                                |> andMap (JD.field "timestamp" JD.float)
                                |> andMap (JD.succeed eventTypeStr)
                                |> andMap (JD.succeed source)
                                |> andMap (JD.field "flowId" (JD.nullable JD.string))
                                |> andMap (JD.at [ "flags", "isCors" ] JD.bool)
                                |> andMap (JD.at [ "flags", "isError" ] JD.bool)
                                |> andMap (JD.at [ "flags", "isAuthRelated" ] JD.bool)
                                |> andMap (JD.field "causedBy" (JD.nullable JD.string))
                                |> andMap (decodeEventData eventTypeStr source)
                        )
            )


andMap : JD.Decoder a -> JD.Decoder (a -> b) -> JD.Decoder b
andMap =
    JD.map2 (|>)


decodeRelevantData : JD.Decoder (Maybe (List ( String, String )))
decodeRelevantData =
    JD.maybe
        (JD.field "relevantData"
            (JD.keyValuePairs JD.string)
        )


decodeEventIssue : JD.Decoder EventIssue
decodeEventIssue =
    JD.map5 EventIssue
        (JD.field "severity" JD.string)
        (JD.field "title" JD.string)
        (JD.field "description" JD.string)
        (JD.field "steps" (JD.list JD.string))
        decodeRelevantData


decodeFlowIssue : JD.Decoder FlowIssue
decodeFlowIssue =
    JD.map8 FlowIssue
        (JD.field "id" JD.string)
        (JD.field "severity" JD.string)
        (JD.field "category" JD.string)
        (JD.field "title" JD.string)
        (JD.field "description" JD.string)
        (JD.field "steps" (JD.list JD.string))
        (JD.field "relatedEventIds" (JD.list JD.string))
        decodeRelevantData


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
    JD.map3 DiagnosisResult
        (JD.field "flowHealth" decodeFlowHealth)
        (JD.field "issues" (JD.list decodeFlowIssue))
        (JD.field "annotatedEvents"
            (JD.keyValuePairs (JD.list decodeEventIssue))
        )


decodeImportMeta : JD.Decoder ImportMeta
decodeImportMeta =
    JD.map3 ImportMeta
        (JD.field "flowId" (JD.nullable JD.string))
        (JD.field "capturedAt" JD.string)
        (JD.field "redacted" JD.bool)


decodeSnapshotMeta : JD.Decoder SnapshotMeta
decodeSnapshotMeta =
    JD.map4 SnapshotMeta
        (JD.field "id" JD.string)
        (JD.field "savedAt" JD.string)
        (JD.field "flowId" (JD.nullable JD.string))
        (JD.field "eventCount" JD.int)
