module Helpers exposing
    ( findEvent
    , findEventInList
    , isSdkNode
    , methodClass
    , nodeColor
    , nodeStatusLabel
    , sdkNodes
    , statusClass
    , truncateId
    )

import Dict exposing (Dict)
import Types exposing (AuthEvent, EventData(..), EventKind(..), NodeStatus(..))


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


nodeColor : NodeStatus -> String
nodeColor status =
    case status of
        Continue ->
            "#58A6FF"

        Success ->
            "#3FB950"

        StatusError ->
            "#F85149"

        Failure ->
            "#F85149"

        UnknownStatus ->
            "#484F58"


nodeStatusLabel : NodeStatus -> String
nodeStatusLabel status =
    case status of
        Continue ->
            "continue"

        Success ->
            "success"

        StatusError ->
            "error"

        Failure ->
            "failure"

        UnknownStatus ->
            "unknown"


truncateId : String -> String
truncateId id =
    String.left 8 id
