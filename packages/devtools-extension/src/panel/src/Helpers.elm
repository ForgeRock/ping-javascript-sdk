module Helpers exposing
    ( EventSource(..)
    , EventType(..)
    , eventSource
    , eventType
    , findEvent
    , findEventInList
    , isSdkNode
    , methodClass
    , nodeColor
    , sdkNodes
    , statusClass
    , truncateId
    )

import Dict exposing (Dict)
import Types exposing (AuthEvent, EventData(..))


type EventType
    = NodeChange
    | JourneyStep
    | OidcState
    | SdkConfig
    | NetworkEvent
    | OtherEvent String


type EventSource
    = SessionSource
    | OtherSource String


eventType : AuthEvent -> EventType
eventType event =
    case event.eventType of
        "sdk:node-change" ->
            NodeChange

        "sdk:journey-step" ->
            JourneyStep

        "sdk:oidc-state" ->
            OidcState

        "sdk:config" ->
            SdkConfig

        _ ->
            if event.source == "network" then
                NetworkEvent

            else
                OtherEvent event.eventType


eventSource : AuthEvent -> EventSource
eventSource event =
    case event.source of
        "session" ->
            SessionSource

        other ->
            OtherSource other


isSdkNode : AuthEvent -> Bool
isSdkNode event =
    case event.data of
        DaVinciNode _ ->
            True

        Journey _ ->
            True

        Oidc _ ->
            True

        _ ->
            False


sdkNodes : List AuthEvent -> List AuthEvent
sdkNodes events =
    List.filter isSdkNode events
        |> List.sortBy .timestamp


findEvent : String -> Dict String AuthEvent -> Maybe AuthEvent
findEvent id eventsById =
    Dict.get id eventsById


findEventInList : String -> List AuthEvent -> Maybe AuthEvent
findEventInList id events =
    List.head (List.filter (\e -> e.id == id) events)


statusClass : Maybe Int -> String
statusClass maybeStatus =
    case maybeStatus of
        Nothing ->
            "st-nil"

        Just 0 ->
            "st-err"

        Just s ->
            if s >= 400 then
                "st-warn"

            else
                "st-ok"


methodClass : Maybe String -> String
methodClass maybeMethod =
    case maybeMethod of
        Nothing ->
            "m-other"

        Just m ->
            case String.toUpper m of
                "GET" ->
                    "m-get"

                "POST" ->
                    "m-post"

                "PUT" ->
                    "m-put"

                "PATCH" ->
                    "m-patch"

                "DELETE" ->
                    "m-del"

                _ ->
                    "m-other"


nodeColor : String -> String
nodeColor status =
    case status of
        "continue" ->
            "#58A6FF"

        "success" ->
            "#3FB950"

        "error" ->
            "#F85149"

        "failure" ->
            "#F85149"

        "Step" ->
            "#58A6FF"

        "LoginSuccess" ->
            "#3FB950"

        "LoginFailure" ->
            "#F85149"

        _ ->
            "#484F58"


truncateId : String -> String
truncateId id =
    String.left 8 id
