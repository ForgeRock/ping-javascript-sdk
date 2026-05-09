module Timeline exposing (view)

import Helpers
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Types exposing (AuthEvent, EventData(..), EventKind(..), EventSource(..), NodeStatus(..))
import Update exposing (Msg(..))


nodeStatusClass : NodeStatus -> String
nodeStatusClass status =
    case status of
        Continue    -> "kv-cont"
        Success     -> "kv-ok"
        StatusError -> "kv-err"
        Failure     -> "kv-err"
        UnknownStatus -> "st-nil"


view : List AuthEvent -> Maybe String -> Html Msg
view events selectedId =
    div []
        (List.map (renderRow selectedId) events)


renderRow : Maybe String -> AuthEvent -> Html Msg
renderRow selectedId event =
    let
        isSelected =
            selectedId == Just event.id

        rowClass =
            if isSelected then "tl-row sel" else "tl-row"
    in
    case event.kind of
        NodeChange ->
            renderSdkRow rowClass event

        SdkConfig ->
            renderConfigRow rowClass event

        SessionEvent ->
            renderSessionRow rowClass event

        _ ->
            renderNetworkRow rowClass event


renderConfigRow : String -> AuthEvent -> Html Msg
renderConfigRow rowClass event =
    div [ class rowClass, onClick (SelectEvent event.id) ]
        [ span [ class "tl-badge b-cfg" ] [ text "CFG" ]
        , span [ class "tl-st st-nil" ] [ text "" ]
        , span [ class "tl-meth" ] [ text "" ]
        , span [ class "tl-desc" ] [ text "SDK Config" ]
        ]


renderSessionRow : String -> AuthEvent -> Html Msg
renderSessionRow rowClass event =
    let
        label =
            case event.data of
                Session sess ->
                    Maybe.withDefault "session" sess.key

                _ ->
                    "session"
    in
    div [ class rowClass, onClick (SelectEvent event.id) ]
        [ span [ class "tl-badge b-ses" ] [ text "SES" ]
        , span [ class "tl-st st-nil" ] [ text "" ]
        , span [ class "tl-meth" ] [ text "" ]
        , span [ class "tl-desc" ] [ text label ]
        ]


renderSdkRow : String -> AuthEvent -> Html Msg
renderSdkRow rowClass event =
    case event.data of
        DaVinciNode node ->
            let
                status =
                    Maybe.withDefault UnknownStatus node.nodeStatus

                statusLabel =
                    Helpers.nodeStatusLabel status

                transitionLabel =
                    case node.previousStatus of
                        Just prev ->
                            Helpers.nodeStatusLabel prev ++ " → " ++ statusLabel

                        Nothing ->
                            statusLabel

                collectorTag =
                    case node.collectors of
                        Just cs ->
                            if List.length cs > 0 then
                                span [ class "tl-tag tag-coll" ]
                                    [ text (String.fromInt (List.length cs) ++ " collectors") ]

                            else
                                text ""

                        Nothing ->
                            text ""
            in
            div [ class rowClass, onClick (SelectEvent event.id) ]
                [ span [ class "tl-badge b-sdk" ] [ text "SDK" ]
                , span [ class ("tl-st " ++ nodeStatusClass status) ] [ text "" ]
                , span [ class "tl-meth" ] [ text "" ]
                , span [ class "tl-desc" ] [ text transitionLabel ]
                , collectorTag
                ]

        _ ->
            text ""


renderNetworkRow : String -> AuthEvent -> Html Msg
renderNetworkRow rowClass event =
    case event.data of
        Network net ->
            let
                statusText =
                    case net.status of
                        Nothing -> "—"
                        Just s  -> String.fromInt s

                durationText =
                    case net.duration of
                        Nothing  -> ""
                        Just ms  ->
                            if ms < 1 then
                                "<1"
                            else
                                String.fromInt (round ms)

                corsTag =
                    if event.isCors then
                        span [ class "tl-tag tag-cors" ] [ text "CORS" ]

                    else
                        text ""

                urlText =
                    Maybe.withDefault "—" net.url
            in
            div [ class rowClass, onClick (SelectEvent event.id) ]
                [ span [ class "tl-badge b-net" ] [ text "NET" ]
                , span [ class ("tl-st " ++ Helpers.statusClass net.status) ] [ text statusText ]
                , span [ class ("tl-meth " ++ Helpers.methodClass net.method) ]
                    [ text (Maybe.withDefault "" net.method) ]
                , span [ class "tl-desc" ] [ text urlText ]
                , corsTag
                , span [ class "tl-dur" ] [ text durationText ]
                ]

        _ ->
            text ""
