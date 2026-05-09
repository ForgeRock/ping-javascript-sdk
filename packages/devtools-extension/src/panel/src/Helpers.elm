module Helpers exposing
    ( findEvent
    , findEventInList
    , hasOidcSemantics
    , isDaVinciNode
    , isJourneyNode
    , isSdkNode
    , isSdkOidcNode
    , learnNodes
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


isDaVinciNode : AuthEvent -> Bool
isDaVinciNode event =
    case event.data of
        DaVinciNode _ ->
            True

        _ ->
            False


isJourneyNode : AuthEvent -> Bool
isJourneyNode event =
    case event.data of
        Journey _ ->
            True

        _ ->
            False


isSdkOidcNode : AuthEvent -> Bool
isSdkOidcNode event =
    case event.data of
        Oidc _ ->
            True

        _ ->
            False


hasOidcSemantics : AuthEvent -> Bool
hasOidcSemantics event =
    event.oidcSemantics /= Nothing


sdkNodes : List AuthEvent -> List AuthEvent
sdkNodes events =
    List.filter isSdkNode events
        |> List.sortBy .timestamp


learnNodes : List AuthEvent -> List AuthEvent
learnNodes events =
    let
        davinci =
            List.filter isDaVinciNode events

        journey =
            List.filter isJourneyNode events

        sdkOidc =
            List.filter isSdkOidcNode events

        -- Network events annotated with OIDC semantics (no SDK bridge).
        -- Only unique OIDC phases — deduplicate by phase to avoid showing
        -- multiple "authorize" nodes for the same phase.
        oidcNet =
            List.filter
                (\e -> not (isSdkNode e) && hasOidcSemantics e)
                events
                |> deduplicateByOidcPhase
    in
    if not (List.isEmpty davinci) then
        davinci |> List.sortBy .timestamp

    else if not (List.isEmpty journey) then
        journey |> List.sortBy .timestamp

    else if not (List.isEmpty sdkOidc) then
        -- SDK OIDC events from the bridge — use these, not network events
        sdkOidc |> List.sortBy .timestamp

    else if not (List.isEmpty oidcNet) then
        -- No SDK — use deduplicated network OIDC events
        oidcNet |> List.sortBy .timestamp

    else
        []


{-| Keep only the last event per OIDC phase so the rail shows one node
per phase (discovery, authorize, token, userinfo) rather than one per
network request.
-}
deduplicateByOidcPhase : List AuthEvent -> List AuthEvent
deduplicateByOidcPhase events =
    let
        phaseOf event =
            Maybe.andThen .oidcPhase event.oidcSemantics
                |> Maybe.withDefault ""

        -- Walk the list and keep the last event per phase
        folder event acc =
            let
                phase =
                    phaseOf event
            in
            if phase == "" then
                acc

            else
                -- Replace any existing event with the same phase
                ( phase, event ) :: List.filter (\( p, _ ) -> p /= phase) acc
    in
    List.foldl folder [] events
        |> List.map Tuple.second
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
