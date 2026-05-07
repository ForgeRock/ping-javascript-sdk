module Graph exposing (view)

import Helpers
import Html exposing (Html, div)
import Html.Attributes exposing (class)
import Json.Decode as Decode
import Svg exposing (..)
import Svg.Attributes as SA
import Svg.Events
import Types exposing (AuthEvent, EventData(..))
import Update exposing (Msg(..))


view : List AuthEvent -> Maybe String -> Maybe String -> Html Msg
view events selectedId hoveredId =
    let
        sdkNodes =
            List.filter (\e -> e.eventType == "sdk:node-change") events

        nodeSpacing =
            90

        totalHeight =
            Basics.max 60 ((List.length sdkNodes * nodeSpacing) + 48)
    in
    if List.isEmpty sdkNodes then
        div [ class "graph-empty" ] [ Svg.text "No SDK nodes" ]

    else
        svg
            [ SA.width "210"
            , SA.height (String.fromInt totalHeight)
            , SA.viewBox ("0 0 210 " ++ String.fromInt totalHeight)
            , SA.class "graph-svg"
            ]
            (defs_
                :: List.concat (List.indexedMap (renderNode nodeSpacing selectedId hoveredId) sdkNodes)
            )


defs_ : Svg Msg
defs_ =
    defs []
        [ Svg.filter [ SA.id "glow-node" ]
            [ feGaussianBlur [ SA.stdDeviation "4", SA.result "blur" ] []
            , feMerge []
                [ feMergeNode [ SA.in_ "blur" ] []
                , feMergeNode [ SA.in_ "SourceGraphic" ] []
                ]
            ]
        ]


renderNode : Int -> Maybe String -> Maybe String -> Int -> AuthEvent -> List (Svg Msg)
renderNode spacing selectedId hoveredId index event =
    let
        cy_ =
            index * spacing + 28

        ( status, maybeName, maybeCollectors ) =
            case event.data of
                DaVinciNode node ->
                    ( Maybe.withDefault "unknown" node.nodeStatus, node.nodeName, node.collectors )

                _ ->
                    ( "unknown", Nothing, Nothing )

        color =
            Helpers.nodeColor status

        isSelected =
            selectedId == Just event.id

        isHovered =
            hoveredId == Just event.id

        connectorLine =
            if index > 0 then
                [ line
                    [ SA.x1 "26"
                    , SA.y1 (String.fromInt (cy_ - spacing + 28))
                    , SA.x2 "26"
                    , SA.y2 (String.fromInt (cy_ - 28))
                    , SA.stroke color
                    , SA.strokeWidth "1"
                    , SA.strokeOpacity
                        (if isHovered || isSelected then
                            "0.5"

                         else
                            "0.2"
                        )
                    , SA.strokeDasharray "4 4"
                    ]
                    []
                ]

            else
                []

        selectionRing =
            if isSelected then
                [ circle
                    [ SA.cx "26"
                    , SA.cy (String.fromInt cy_)
                    , SA.r "19"
                    , SA.fill "none"
                    , SA.stroke color
                    , SA.strokeWidth "1.5"
                    , SA.strokeOpacity "0.5"
                    , SA.class "graph-ring"
                    ]
                    []
                ]

            else
                []

        hoverRing =
            if isHovered && not isSelected then
                [ circle
                    [ SA.cx "26"
                    , SA.cy (String.fromInt cy_)
                    , SA.r "16"
                    , SA.fill "none"
                    , SA.stroke color
                    , SA.strokeWidth "1"
                    , SA.strokeOpacity "0.4"
                    ]
                    []
                ]

            else
                []

        nodeFilterAttr =
            if isSelected then
                SA.filter "url(#glow-node)"

            else if isHovered then
                SA.filter "url(#glow-node)"

            else
                SA.class ""

        nodeBg =
            circle
                [ SA.cx "26"
                , SA.cy (String.fromInt cy_)
                , SA.r "10"
                , SA.fill color
                , nodeFilterAttr
                ]
                []

        statusLabel =
            Svg.text_
                [ SA.x "44"
                , SA.y (String.fromInt (cy_ + 4))
                , SA.fontSize "12"
                , SA.fill
                    (if isHovered || isSelected then
                        "#ffffff"

                     else
                        "#E6EDF3"
                    )
                , SA.fontFamily "'Segoe UI', system-ui, sans-serif"
                ]
                [ Svg.text status ]

        subLabel =
            let
                subFill =
                    if isHovered || isSelected then
                        "#c9d1d9"

                    else
                        "#8B949E"
            in
            case maybeName of
                Just name ->
                    [ Svg.text_
                        [ SA.x "44"
                        , SA.y (String.fromInt (cy_ + 17))
                        , SA.fontSize "10"
                        , SA.fill subFill
                        , SA.fontFamily "'Segoe UI', system-ui, sans-serif"
                        ]
                        [ Svg.text name ]
                    ]

                Nothing ->
                    case maybeCollectors of
                        Just cs ->
                            if List.length cs > 0 then
                                [ Svg.text_
                                    [ SA.x "44"
                                    , SA.y (String.fromInt (cy_ + 17))
                                    , SA.fontSize "10"
                                    , SA.fill subFill
                                    , SA.fontFamily "'Segoe UI', system-ui, sans-serif"
                                    ]
                                    [ Svg.text (String.fromInt (List.length cs) ++ " collectors") ]
                                ]

                            else
                                []

                        Nothing ->
                            []

        -- Invisible hit area for reliable mouse events
        hitArea =
            rect
                [ SA.x "0"
                , SA.y (String.fromInt (cy_ - 20))
                , SA.width "200"
                , SA.height "40"
                , SA.fill "transparent"
                , SA.style "cursor:pointer"
                ]
                []
    in
    connectorLine
        ++ selectionRing
        ++ hoverRing
        ++ [ g
                [ Svg.Events.onClick (SelectNode event.id)
                , Svg.Events.on "mouseenter" (Decode.succeed (HoverNode (Just event.id)))
                , Svg.Events.on "mouseleave" (Decode.succeed (HoverNode Nothing))
                , SA.style "cursor:pointer"
                ]
                ([ hitArea, nodeBg, statusLabel ] ++ subLabel)
           ]
