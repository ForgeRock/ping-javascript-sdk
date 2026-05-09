module DecodeTests exposing (suite)

import Decode exposing (decodeAuthEvent, decodeDiagnosisResult, decodeImportMeta, decodeSnapshotMeta)
import Expect
import Json.Decode as JD
import Test exposing (Test, describe, test)
import Types exposing (EventData(..), EventKind(..), EventSource(..), FlowHealth(..), NodeStatus(..), Severity(..))


baseEventJson : String -> String -> String -> String
baseEventJson eventType source dataJson =
    """
    { "id": "evt-001"
    , "timestamp": 1700000000000
    , "type": \""""
        ++ eventType
        ++ """"
    , "source": \""""
        ++ source
        ++ """"
    , "flowId": "flow-abc"
    , "causedBy": null
    , "flags": { "isCors": false, "isError": false, "isAuthRelated": true }
    , "data": """
        ++ dataJson
        ++ """
    }"""


suite : Test
suite =
    describe "Decode"
        [ decodeAuthEventTests
        , decodeNodeDataSubObjectTests
        , decodeDiagnosisTests
        , decodeRelevantDataTests
        , decodeImportMetaTests
        , decodeSnapshotMetaTests
        , decodeSeverityTests
        ]


decodeAuthEventTests : Test
decodeAuthEventTests =
    describe "decodeAuthEvent"
        [ test "decodes a network event" <|
            \_ ->
                let
                    json =
                        baseEventJson "network:response"
                            "network"
                            """{ "_tag": "network", "url": "https://auth.example.com/token", "method": "POST", "status": 200, "duration": 123, "requestHeaders": {}, "responseHeaders": {} }"""

                    result =
                        JD.decodeString decodeAuthEvent json
                in
                case result of
                    Ok event ->
                        Expect.all
                            [ \e -> Expect.equal "evt-001" e.id
                            , \e -> Expect.equal NetworkEvent e.kind
                            , \e -> Expect.equal NetworkSource e.source
                            , \e ->
                                case e.data of
                                    Network nd ->
                                        Expect.equal (Just 200) nd.status

                                    _ ->
                                        Expect.fail "Expected Network data variant"
                            ]
                            event

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes a sdk:node-change event" <|
            \_ ->
                let
                    json =
                        baseEventJson "sdk:node-change"
                            "sdk"
                            """{ "_tag": "sdk", "nodeStatus": "continue", "interactionId": "int-1", "nodeName": "Username" }"""

                    result =
                        JD.decodeString decodeAuthEvent json
                in
                case result of
                    Ok event ->
                        Expect.all
                            [ \e -> Expect.equal NodeChange e.kind
                            , \e -> Expect.equal SdkSource e.source
                            , \e ->
                                case e.data of
                                    DaVinciNode nd ->
                                        Expect.all
                                            [ \n -> Expect.equal (Just Continue) n.nodeStatus
                                            , \n -> Expect.equal (Just "int-1") n.interactionId
                                            , \n -> Expect.equal (Just "Username") n.nodeName
                                            ]
                                            nd

                                    _ ->
                                        Expect.fail "Expected DaVinciNode data variant"
                            ]
                            event

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes a sdk:journey-step event" <|
            \_ ->
                let
                    json =
                        baseEventJson "sdk:journey-step"
                            "sdk"
                            """{ "_tag": "journey", "stepType": "Step", "authId": "abc123", "stage": "UsernamePassword", "header": "Sign In" }"""

                    result =
                        JD.decodeString decodeAuthEvent json
                in
                case result of
                    Ok event ->
                        Expect.all
                            [ \e -> Expect.equal JourneyStep e.kind
                            , \e ->
                                case e.data of
                                    Journey jd ->
                                        Expect.all
                                            [ \j -> Expect.equal (Just "Step") j.stepType
                                            , \j -> Expect.equal (Just "abc123") j.authId
                                            , \j -> Expect.equal (Just "UsernamePassword") j.stage
                                            ]
                                            jd

                                    _ ->
                                        Expect.fail "Expected Journey data variant"
                            ]
                            event

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes a sdk:oidc-state event" <|
            \_ ->
                let
                    json =
                        baseEventJson "sdk:oidc-state"
                            "sdk"
                            """{ "_tag": "oidc", "phase": "authorize", "status": "success", "clientId": "my-app" }"""

                    result =
                        JD.decodeString decodeAuthEvent json
                in
                case result of
                    Ok event ->
                        Expect.all
                            [ \e -> Expect.equal OidcState e.kind
                            , \e ->
                                case e.data of
                                    Oidc od ->
                                        Expect.all
                                            [ \o -> Expect.equal (Just "authorize") o.phase
                                            , \o -> Expect.equal (Just "success") o.status
                                            , \o -> Expect.equal (Just "my-app") o.clientId
                                            ]
                                            od

                                    _ ->
                                        Expect.fail "Expected Oidc data variant"
                            ]
                            event

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes a session event" <|
            \_ ->
                let
                    json =
                        baseEventJson "session:storage"
                            "session"
                            """{ "_tag": "session", "key": "token", "before": "old", "after": "new" }"""

                    result =
                        JD.decodeString decodeAuthEvent json
                in
                case result of
                    Ok event ->
                        Expect.all
                            [ \e -> Expect.equal SessionEvent e.kind
                            , \e -> Expect.equal SessionSource e.source
                            , \e ->
                                case e.data of
                                    Session sd ->
                                        Expect.all
                                            [ \s -> Expect.equal (Just "token") s.key
                                            , \s -> Expect.equal (Just "old") s.before
                                            , \s -> Expect.equal (Just "new") s.after
                                            ]
                                            sd

                                    _ ->
                                        Expect.fail "Expected Session data variant"
                            ]
                            event

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes a sdk:config event" <|
            \_ ->
                let
                    json =
                        baseEventJson "sdk:config"
                            "sdk"
                            """{ "_tag": "sdk-config", "config": { "serverUrl": "https://auth.example.com" } }"""

                    result =
                        JD.decodeString decodeAuthEvent json
                in
                case result of
                    Ok event ->
                        Expect.all
                            [ \e -> Expect.equal SdkConfig e.kind
                            , \e ->
                                case e.data of
                                    Config _ ->
                                        Expect.pass

                                    _ ->
                                        Expect.fail "Expected Config data variant"
                            ]
                            event

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes flags correctly" <|
            \_ ->
                let
                    json =
                        """
                        { "id": "evt-cors"
                        , "timestamp": 100
                        , "type": "network:response"
                        , "source": "network"
                        , "flowId": null
                        , "causedBy": null
                        , "flags": { "isCors": true, "isError": true, "isAuthRelated": false }
                        , "data": { "_tag": "network", "status": 0, "method": "POST", "url": "https://x.com", "duration": 0, "requestHeaders": {}, "responseHeaders": {} }
                        }"""

                    result =
                        JD.decodeString decodeAuthEvent json
                in
                case result of
                    Ok event ->
                        Expect.all
                            [ \e -> Expect.equal True e.isCors
                            , \e -> Expect.equal True e.isError
                            , \e -> Expect.equal False e.isAuthRelated
                            , \e -> Expect.equal Nothing e.flowId
                            ]
                            event

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes causedBy string" <|
            \_ ->
                let
                    json =
                        """
                        { "id": "evt-1"
                        , "timestamp": 100
                        , "type": "network:response"
                        , "source": "network"
                        , "flowId": null
                        , "causedBy": "sdk-42"
                        , "flags": { "isCors": false, "isError": false, "isAuthRelated": true }
                        , "data": { "_tag": "network", "status": 200, "method": "GET", "url": "https://x.com", "duration": 10, "requestHeaders": {}, "responseHeaders": {} }
                        }"""

                    result =
                        JD.decodeString decodeAuthEvent json
                in
                case result of
                    Ok event ->
                        Expect.equal (Just "sdk-42") event.causedBy

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "falls back to Network for unknown event type with non-session source" <|
            \_ ->
                let
                    json =
                        baseEventJson "network:request"
                            "network"
                            """{ "_tag": "network", "status": 302, "method": "GET", "url": "https://x.com/redirect", "duration": 5, "requestHeaders": {}, "responseHeaders": {} }"""

                    result =
                        JD.decodeString decodeAuthEvent json
                in
                case result of
                    Ok event ->
                        case event.data of
                            Network _ ->
                                Expect.pass

                            _ ->
                                Expect.fail "Expected Network data variant for unknown type"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        ]


decodeNodeDataSubObjectTests : Test
decodeNodeDataSubObjectTests =
    describe "decodeAuthEvent (node sub-objects)"
        [ test "decodes sdk:node-change with error sub-object" <|
            \_ ->
                let
                    json =
                        baseEventJson "sdk:node-change"
                            "sdk"
                            """{ "_tag": "sdk", "nodeStatus": "error", "error": { "code": "E001", "message": "Auth failed", "type": "authentication", "internalHttpStatus": 401 } }"""
                in
                case JD.decodeString decodeAuthEvent json of
                    Ok event ->
                        case event.data of
                            DaVinciNode nd ->
                                Expect.all
                                    [ \n -> Expect.equal (Just StatusError) n.nodeStatus
                                    , \n ->
                                        case n.sdkError of
                                            Just err ->
                                                Expect.all
                                                    [ \e -> Expect.equal "E001" e.code
                                                    , \e -> Expect.equal "Auth failed" e.message
                                                    , \e -> Expect.equal "authentication" e.errorType
                                                    , \e -> Expect.equal (Just 401) e.internalHttpStatus
                                                    ]
                                                    err

                                            Nothing ->
                                                Expect.fail "Expected error to be present"
                                    ]
                                    nd

                            _ ->
                                Expect.fail "Expected DaVinciNode"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes sdk:node-change with error without internalHttpStatus" <|
            \_ ->
                let
                    json =
                        baseEventJson "sdk:node-change"
                            "sdk"
                            """{ "_tag": "sdk", "nodeStatus": "error", "error": { "code": "E002", "message": "Timeout", "type": "network" } }"""
                in
                case JD.decodeString decodeAuthEvent json of
                    Ok event ->
                        case event.data of
                            DaVinciNode nd ->
                                case nd.sdkError of
                                    Just err ->
                                        Expect.equal Nothing err.internalHttpStatus

                                    Nothing ->
                                        Expect.fail "Expected error to be present"

                            _ ->
                                Expect.fail "Expected DaVinciNode"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes sdk:node-change with authorization sub-object" <|
            \_ ->
                let
                    json =
                        baseEventJson "sdk:node-change"
                            "sdk"
                            """{ "_tag": "sdk", "nodeStatus": "success", "authorization": { "code": "auth-code-123", "state": "state-xyz" } }"""
                in
                case JD.decodeString decodeAuthEvent json of
                    Ok event ->
                        case event.data of
                            DaVinciNode nd ->
                                Expect.all
                                    [ \n -> Expect.equal (Just Success) n.nodeStatus
                                    , \n ->
                                        case n.authorization of
                                            Just auth ->
                                                Expect.all
                                                    [ \a -> Expect.equal (Just "auth-code-123") a.code
                                                    , \a -> Expect.equal (Just "state-xyz") a.state
                                                    ]
                                                    auth

                                            Nothing ->
                                                Expect.fail "Expected authorization to be present"
                                    ]
                                    nd

                            _ ->
                                Expect.fail "Expected DaVinciNode"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes sdk:node-change with authorization with optional fields omitted" <|
            \_ ->
                let
                    json =
                        baseEventJson "sdk:node-change"
                            "sdk"
                            """{ "_tag": "sdk", "nodeStatus": "success", "authorization": {} }"""
                in
                case JD.decodeString decodeAuthEvent json of
                    Ok event ->
                        case event.data of
                            DaVinciNode nd ->
                                case nd.authorization of
                                    Just auth ->
                                        Expect.all
                                            [ \a -> Expect.equal Nothing a.code
                                            , \a -> Expect.equal Nothing a.state
                                            ]
                                            auth

                                    Nothing ->
                                        Expect.fail "Expected authorization to be present"

                            _ ->
                                Expect.fail "Expected DaVinciNode"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes sdk:node-change with all optional fields" <|
            \_ ->
                let
                    json =
                        baseEventJson "sdk:node-change"
                            "sdk"
                            """{ "_tag": "sdk", "nodeStatus": "continue", "previousStatus": "start", "interactionId": "int-1", "interactionToken": "tok-1", "nodeId": "node-1", "requestId": "req-1", "nodeName": "Password", "nodeDescription": "Enter password", "eventName": "click", "httpStatus": 200, "session": "sess-abc" }"""
                in
                case JD.decodeString decodeAuthEvent json of
                    Ok event ->
                        case event.data of
                            DaVinciNode nd ->
                                Expect.all
                                    [ \n -> Expect.equal (Just Continue) n.nodeStatus
                                    , \n -> Expect.equal (Just UnknownStatus) n.previousStatus
                                    , \n -> Expect.equal (Just "int-1") n.interactionId
                                    , \n -> Expect.equal (Just "tok-1") n.interactionToken
                                    , \n -> Expect.equal (Just "node-1") n.nodeId
                                    , \n -> Expect.equal (Just "req-1") n.requestId
                                    , \n -> Expect.equal (Just "Password") n.nodeName
                                    , \n -> Expect.equal (Just "Enter password") n.nodeDescription
                                    , \n -> Expect.equal (Just "click") n.eventName
                                    , \n -> Expect.equal (Just 200) n.httpStatus
                                    , \n -> Expect.equal (Just "sess-abc") n.session
                                    ]
                                    nd

                            _ ->
                                Expect.fail "Expected DaVinciNode"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes sdk:node-change with minimal fields" <|
            \_ ->
                let
                    json =
                        baseEventJson "sdk:node-change"
                            "sdk"
                            """{ "_tag": "sdk" }"""
                in
                case JD.decodeString decodeAuthEvent json of
                    Ok event ->
                        case event.data of
                            DaVinciNode nd ->
                                Expect.all
                                    [ \n -> Expect.equal Nothing n.nodeStatus
                                    , \n -> Expect.equal Nothing n.previousStatus
                                    , \n -> Expect.equal Nothing n.sdkError
                                    , \n -> Expect.equal Nothing n.authorization
                                    , \n -> Expect.equal Nothing n.collectors
                                    ]
                                    nd

                            _ ->
                                Expect.fail "Expected DaVinciNode"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        ]


decodeRelevantDataTests : Test
decodeRelevantDataTests =
    describe "relevantData in issues"
        [ test "decodes flow issue with relevantData" <|
            \_ ->
                let
                    json =
                        """
                        { "flowHealth": "warning"
                        , "issues": [
                            { "id": "tok-1"
                            , "severity": "warning"
                            , "category": "token"
                            , "title": "Missing Token"
                            , "description": "No interaction token"
                            , "steps": ["Check config"]
                            , "relatedEventIds": ["evt-1"]
                            , "relevantData": { "interactionToken": "null", "nodeId": "abc" }
                            }
                          ]
                        , "annotatedEvents": {}
                        }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        case d.issues of
                            [ issue ] ->
                                Expect.all
                                    [ \i -> Expect.equal SevWarning i.severity
                                    , \i ->
                                        case i.relevantData of
                                            Just pairs ->
                                                Expect.equal True (List.length pairs == 2)

                                            Nothing ->
                                                Expect.fail "Expected relevantData to be present"
                                    ]
                                    issue

                            _ ->
                                Expect.fail "Expected exactly one issue"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes flow issue without relevantData" <|
            \_ ->
                let
                    json =
                        """
                        { "flowHealth": "error"
                        , "issues": [
                            { "id": "cors-1"
                            , "severity": "error"
                            , "category": "cors"
                            , "title": "CORS Blocked"
                            , "description": "Blocked"
                            , "steps": []
                            , "relatedEventIds": []
                            }
                          ]
                        , "annotatedEvents": {}
                        }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        case d.issues of
                            [ issue ] ->
                                Expect.all
                                    [ \i -> Expect.equal SevError i.severity
                                    , \i -> Expect.equal Nothing i.relevantData
                                    ]
                                    issue

                            _ ->
                                Expect.fail "Expected exactly one issue"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes event issue with relevantData" <|
            \_ ->
                let
                    json =
                        """
                        { "flowHealth": "warning"
                        , "issues": []
                        , "annotatedEvents": {
                            "evt-1": [
                              { "severity": "warning"
                              , "title": "Expired JWT"
                              , "description": "Token expired"
                              , "steps": ["Refresh"]
                              , "relevantData": { "exp": "1700000000", "now": "1700000100" }
                              }
                            ]
                          }
                        }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        case d.annotatedEvents of
                            [ ( _, [ issue ] ) ] ->
                                Expect.all
                                    [ \i -> Expect.equal SevWarning i.severity
                                    , \i ->
                                        case i.relevantData of
                                            Just pairs ->
                                                Expect.equal 2 (List.length pairs)

                                            Nothing ->
                                                Expect.fail "Expected relevantData"
                                    ]
                                    issue

                            _ ->
                                Expect.fail "Expected one annotated event"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes event issue without relevantData" <|
            \_ ->
                let
                    json =
                        """
                        { "flowHealth": "warning"
                        , "issues": []
                        , "annotatedEvents": {
                            "evt-1": [
                              { "severity": "info"
                              , "title": "Status Zero"
                              , "description": "Request failed"
                              , "steps": []
                              }
                            ]
                          }
                        }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        case d.annotatedEvents of
                            [ ( _, [ issue ] ) ] ->
                                Expect.all
                                    [ \i -> Expect.equal SevInfo i.severity
                                    , \i -> Expect.equal Nothing i.relevantData
                                    ]
                                    issue

                            _ ->
                                Expect.fail "Expected one annotated event"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        ]


decodeDiagnosisTests : Test
decodeDiagnosisTests =
    describe "decodeDiagnosisResult"
        [ test "decodes a healthy diagnosis" <|
            \_ ->
                let
                    json =
                        """
                        { "flowHealth": "healthy"
                        , "issues": []
                        , "annotatedEvents": {}
                        }"""

                    result =
                        JD.decodeString decodeDiagnosisResult json
                in
                case result of
                    Ok diagnosis ->
                        Expect.all
                            [ \d -> Expect.equal Healthy d.flowHealth
                            , \d -> Expect.equal [] d.issues
                            , \d -> Expect.equal [] d.annotatedEvents
                            ]
                            diagnosis

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes error flow health" <|
            \_ ->
                let
                    json =
                        """{ "flowHealth": "error", "issues": [], "annotatedEvents": {} }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        Expect.equal Error d.flowHealth

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes warning flow health" <|
            \_ ->
                let
                    json =
                        """{ "flowHealth": "warning", "issues": [], "annotatedEvents": {} }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        Expect.equal Warning d.flowHealth

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes issues with flow issue fields" <|
            \_ ->
                let
                    json =
                        """
                        { "flowHealth": "error"
                        , "issues": [
                            { "id": "cors-1"
                            , "severity": "error"
                            , "category": "cors"
                            , "title": "CORS Blocked"
                            , "description": "Request blocked"
                            , "steps": ["Check headers", "Add allow-origin"]
                            , "relatedEventIds": ["evt-1", "evt-2"]
                            }
                          ]
                        , "annotatedEvents": {}
                        }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        case d.issues of
                            [ issue ] ->
                                Expect.all
                                    [ \i -> Expect.equal "cors-1" i.id
                                    , \i -> Expect.equal SevError i.severity
                                    , \i -> Expect.equal "cors" i.category
                                    , \i -> Expect.equal [ "Check headers", "Add allow-origin" ] i.steps
                                    , \i -> Expect.equal [ "evt-1", "evt-2" ] i.relatedEventIds
                                    ]
                                    issue

                            _ ->
                                Expect.fail "Expected exactly one issue"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes annotated events with event issues" <|
            \_ ->
                let
                    json =
                        """
                        { "flowHealth": "warning"
                        , "issues": []
                        , "annotatedEvents": {
                            "evt-1": [
                              { "severity": "warning"
                              , "title": "Expired JWT"
                              , "description": "Token has expired"
                              , "steps": ["Refresh token"]
                              }
                            ]
                          }
                        }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        case d.annotatedEvents of
                            [ ( eventId, [ issue ] ) ] ->
                                Expect.all
                                    [ \_ -> Expect.equal "evt-1" eventId
                                    , \_ -> Expect.equal SevWarning issue.severity
                                    , \_ -> Expect.equal "Expired JWT" issue.title
                                    ]
                                    ()

                            _ ->
                                Expect.fail "Expected one annotated event entry"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        ]


decodeImportMetaTests : Test
decodeImportMetaTests =
    describe "decodeImportMeta"
        [ test "decodes import meta with flowId" <|
            \_ ->
                let
                    json =
                        """{ "flowId": "flow-abc", "capturedAt": "2026-05-08T14:30:00.000Z", "redacted": true }"""
                in
                case JD.decodeString decodeImportMeta json of
                    Ok meta ->
                        Expect.all
                            [ \m -> Expect.equal (Just "flow-abc") m.flowId
                            , \m -> Expect.equal "2026-05-08T14:30:00.000Z" m.capturedAt
                            , \m -> Expect.equal True m.redacted
                            ]
                            meta

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes null flowId" <|
            \_ ->
                let
                    json =
                        """{ "flowId": null, "capturedAt": "2026-05-08T14:30:00.000Z", "redacted": false }"""
                in
                case JD.decodeString decodeImportMeta json of
                    Ok meta ->
                        Expect.equal Nothing meta.flowId

                    Err err ->
                        Expect.fail (JD.errorToString err)
        ]


decodeSnapshotMetaTests : Test
decodeSnapshotMetaTests =
    describe "decodeSnapshotMeta"
        [ test "decodes a snapshot meta" <|
            \_ ->
                let
                    json =
                        """{ "id": "snap-1", "savedAt": "2026-05-08T15:00:00.000Z", "flowId": "flow-abc", "eventCount": 5 }"""
                in
                case JD.decodeString decodeSnapshotMeta json of
                    Ok meta ->
                        Expect.all
                            [ \m -> Expect.equal "snap-1" m.id
                            , \m -> Expect.equal (Just "flow-abc") m.flowId
                            , \m -> Expect.equal 5 m.eventCount
                            ]
                            meta

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes null flowId" <|
            \_ ->
                let
                    json =
                        """{ "id": "snap-2", "savedAt": "2026-05-08T15:00:00.000Z", "flowId": null, "eventCount": 0 }"""
                in
                case JD.decodeString decodeSnapshotMeta json of
                    Ok meta ->
                        Expect.equal Nothing meta.flowId

                    Err err ->
                        Expect.fail (JD.errorToString err)
        ]


decodeSeverityTests : Test
decodeSeverityTests =
    describe "decodeSeverity via EventIssue"
        [ test "decodes error severity" <|
            \_ ->
                let
                    json =
                        """{ "flowHealth": "warning", "issues": [], "annotatedEvents": { "e1": [{ "severity": "error", "title": "T", "description": "D", "steps": [] }] } }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        case d.annotatedEvents of
                            [ ( _, [ issue ] ) ] ->
                                Expect.equal SevError issue.severity

                            _ ->
                                Expect.fail "Expected one annotated event"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes warning severity" <|
            \_ ->
                let
                    json =
                        """{ "flowHealth": "warning", "issues": [], "annotatedEvents": { "e1": [{ "severity": "warning", "title": "T", "description": "D", "steps": [] }] } }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        case d.annotatedEvents of
                            [ ( _, [ issue ] ) ] ->
                                Expect.equal SevWarning issue.severity

                            _ ->
                                Expect.fail "Expected one annotated event"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        , test "decodes unknown severity as info" <|
            \_ ->
                let
                    json =
                        """{ "flowHealth": "warning", "issues": [], "annotatedEvents": { "e1": [{ "severity": "info", "title": "T", "description": "D", "steps": [] }] } }"""
                in
                case JD.decodeString decodeDiagnosisResult json of
                    Ok d ->
                        case d.annotatedEvents of
                            [ ( _, [ issue ] ) ] ->
                                Expect.equal SevInfo issue.severity

                            _ ->
                                Expect.fail "Expected one annotated event"

                    Err err ->
                        Expect.fail (JD.errorToString err)
        ]
