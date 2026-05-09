module HelpersTests exposing (suite)

import Dict
import Expect
import Helpers exposing (findEvent, findEventInList, isSdkNode, methodClass, nodeColor, nodeStatusLabel, sdkNodes, statusClass, truncateId)
import Test exposing (Test, describe, test)
import Types exposing (AuthEvent, EventData(..), EventKind(..), EventSource(..), JourneyData, NetworkData, NodeData, NodeStatus(..), OidcData, SessionData)


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
    }


makeSdkEvent : String -> Float -> AuthEvent
makeSdkEvent id ts =
    { id = id
    , timestamp = ts
    , kind = NodeChange
    , source = SdkSource
    , flowId = Nothing
    , isCors = False
    , isError = False
    , isAuthRelated = True
    , causedBy = Nothing
    , data = DaVinciNode (NodeData (Just Continue) Nothing Nothing Nothing Nothing Nothing (Just "Username") Nothing Nothing Nothing Nothing Nothing Nothing Nothing Nothing)
    }


makeJourneyEvent : String -> Float -> AuthEvent
makeJourneyEvent id ts =
    { id = id
    , timestamp = ts
    , kind = JourneyStep
    , source = SdkSource
    , flowId = Nothing
    , isCors = False
    , isError = False
    , isAuthRelated = True
    , causedBy = Nothing
    , data = Journey (JourneyData (Just "Step") Nothing Nothing Nothing Nothing (Just "abc") Nothing Nothing Nothing Nothing Nothing)
    }


makeOidcEvent : String -> Float -> AuthEvent
makeOidcEvent id ts =
    { id = id
    , timestamp = ts
    , kind = OidcState
    , source = SdkSource
    , flowId = Nothing
    , isCors = False
    , isError = False
    , isAuthRelated = True
    , causedBy = Nothing
    , data = Oidc (OidcData (Just "authorize") (Just "success") Nothing Nothing Nothing)
    }


makeSessionEvent : String -> AuthEvent
makeSessionEvent id =
    { id = id
    , timestamp = 100
    , kind = SessionEvent
    , source = SessionSource
    , flowId = Nothing
    , isCors = False
    , isError = False
    , isAuthRelated = True
    , causedBy = Nothing
    , data = Session (SessionData (Just "token") (Just "old") (Just "new"))
    }


makeConfigEvent : String -> AuthEvent
makeConfigEvent id =
    { id = id
    , timestamp = 100
    , kind = SdkConfig
    , source = SdkSource
    , flowId = Nothing
    , isCors = False
    , isError = False
    , isAuthRelated = True
    , causedBy = Nothing
    , data = Config Nothing
    }


suite : Test
suite =
    describe "Helpers"
        [ isSdkNodeTests
        , sdkNodesTests
        , findEventTests
        , statusClassTests
        , methodClassTests
        , nodeColorTests
        , nodeStatusLabelTests
        , truncateIdTests
        ]


isSdkNodeTests : Test
isSdkNodeTests =
    describe "isSdkNode"
        [ test "DaVinciNode is SDK node" <|
            \_ -> Expect.equal True (isSdkNode (makeSdkEvent "e1" 0))
        , test "Journey is SDK node" <|
            \_ -> Expect.equal True (isSdkNode (makeJourneyEvent "e1" 0))
        , test "Oidc is SDK node" <|
            \_ -> Expect.equal True (isSdkNode (makeOidcEvent "e1" 0))
        , test "Network is NOT SDK node" <|
            \_ -> Expect.equal False (isSdkNode (makeNetworkEvent "e1"))
        , test "Session is NOT SDK node" <|
            \_ -> Expect.equal False (isSdkNode (makeSessionEvent "e1"))
        , test "Config is NOT SDK node" <|
            \_ -> Expect.equal False (isSdkNode (makeConfigEvent "e1"))
        ]


sdkNodesTests : Test
sdkNodesTests =
    describe "sdkNodes"
        [ test "filters to only SDK events" <|
            \_ ->
                let
                    events =
                        [ makeNetworkEvent "n1"
                        , makeSdkEvent "s1" 200
                        , makeSessionEvent "ss1"
                        , makeJourneyEvent "j1" 100
                        ]
                in
                Expect.equal [ "j1", "s1" ] (List.map .id (sdkNodes events))
        , test "sorts by timestamp" <|
            \_ ->
                let
                    events =
                        [ makeSdkEvent "s2" 300
                        , makeSdkEvent "s1" 100
                        , makeSdkEvent "s3" 200
                        ]
                in
                Expect.equal [ "s1", "s3", "s2" ] (List.map .id (sdkNodes events))
        , test "returns empty list for no SDK nodes" <|
            \_ ->
                Expect.equal [] (sdkNodes [ makeNetworkEvent "n1" ])
        ]


findEventTests : Test
findEventTests =
    describe "findEvent / findEventInList"
        [ test "findEvent finds event by id in Dict" <|
            \_ ->
                let
                    evts =
                        Dict.fromList [ ( "e1", makeNetworkEvent "e1" ), ( "e2", makeSdkEvent "e2" 0 ) ]
                in
                case findEvent "e2" evts of
                    Just e ->
                        Expect.equal "e2" e.id

                    Nothing ->
                        Expect.fail "Expected to find event e2"
        , test "findEvent returns Nothing for missing id" <|
            \_ ->
                Expect.equal Nothing (findEvent "missing" Dict.empty)
        , test "findEventInList finds event by id" <|
            \_ ->
                let
                    events =
                        [ makeNetworkEvent "e1", makeSdkEvent "e2" 0 ]
                in
                case findEventInList "e2" events of
                    Just e ->
                        Expect.equal "e2" e.id

                    Nothing ->
                        Expect.fail "Expected to find event e2"
        , test "findEventInList returns Nothing for missing id" <|
            \_ ->
                Expect.equal Nothing (findEventInList "missing" [])
        ]


statusClassTests : Test
statusClassTests =
    describe "statusClass"
        [ test "Nothing → st-nil" <|
            \_ -> Expect.equal "st-nil" (statusClass Nothing)
        , test "0 → st-err" <|
            \_ -> Expect.equal "st-err" (statusClass (Just 0))
        , test "200 → st-ok" <|
            \_ -> Expect.equal "st-ok" (statusClass (Just 200))
        , test "302 → st-ok" <|
            \_ -> Expect.equal "st-ok" (statusClass (Just 302))
        , test "400 → st-warn" <|
            \_ -> Expect.equal "st-warn" (statusClass (Just 400))
        , test "500 → st-warn" <|
            \_ -> Expect.equal "st-warn" (statusClass (Just 500))
        ]


methodClassTests : Test
methodClassTests =
    describe "methodClass"
        [ test "Nothing → m-other" <|
            \_ -> Expect.equal "m-other" (methodClass Nothing)
        , test "GET → m-get" <|
            \_ -> Expect.equal "m-get" (methodClass (Just "GET"))
        , test "POST → m-post" <|
            \_ -> Expect.equal "m-post" (methodClass (Just "POST"))
        , test "PUT → m-put" <|
            \_ -> Expect.equal "m-put" (methodClass (Just "PUT"))
        , test "PATCH → m-patch" <|
            \_ -> Expect.equal "m-patch" (methodClass (Just "PATCH"))
        , test "DELETE → m-del" <|
            \_ -> Expect.equal "m-del" (methodClass (Just "DELETE"))
        , test "lowercase get → m-get" <|
            \_ -> Expect.equal "m-get" (methodClass (Just "get"))
        , test "OPTIONS → m-other" <|
            \_ -> Expect.equal "m-other" (methodClass (Just "OPTIONS"))
        ]


nodeColorTests : Test
nodeColorTests =
    describe "nodeColor"
        [ test "Continue → blue" <|
            \_ -> Expect.equal "#58A6FF" (nodeColor Continue)
        , test "Success → green" <|
            \_ -> Expect.equal "#3FB950" (nodeColor Success)
        , test "StatusError → red" <|
            \_ -> Expect.equal "#F85149" (nodeColor StatusError)
        , test "Failure → red" <|
            \_ -> Expect.equal "#F85149" (nodeColor Failure)
        , test "UnknownStatus → gray" <|
            \_ -> Expect.equal "#484F58" (nodeColor UnknownStatus)
        ]


nodeStatusLabelTests : Test
nodeStatusLabelTests =
    describe "nodeStatusLabel"
        [ test "Continue → continue" <|
            \_ -> Expect.equal "continue" (nodeStatusLabel Continue)
        , test "Success → success" <|
            \_ -> Expect.equal "success" (nodeStatusLabel Success)
        , test "StatusError → error" <|
            \_ -> Expect.equal "error" (nodeStatusLabel StatusError)
        , test "Failure → failure" <|
            \_ -> Expect.equal "failure" (nodeStatusLabel Failure)
        , test "UnknownStatus → unknown" <|
            \_ -> Expect.equal "unknown" (nodeStatusLabel UnknownStatus)
        ]


truncateIdTests : Test
truncateIdTests =
    describe "truncateId"
        [ test "truncates to 8 characters" <|
            \_ -> Expect.equal "abcdefgh" (truncateId "abcdefghijklmnop")
        , test "returns short strings unchanged" <|
            \_ -> Expect.equal "abc" (truncateId "abc")
        ]
