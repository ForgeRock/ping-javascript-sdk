module JsonTree exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Json.Decode as Decode


type JsonVal
    = JString String
    | JNumber Float
    | JBool Bool
    | JNull
    | JArray (List JsonVal)
    | JObject (List ( String, JsonVal ))


decodeJsonVal : Decode.Decoder JsonVal
decodeJsonVal =
    Decode.oneOf
        [ Decode.map JString Decode.string
        , Decode.map JNumber Decode.float
        , Decode.map JBool Decode.bool
        , Decode.null JNull
        , Decode.map JArray (Decode.list (Decode.lazy (\_ -> decodeJsonVal)))
        , Decode.map JObject (Decode.keyValuePairs (Decode.lazy (\_ -> decodeJsonVal)))
        ]


authKeys : List String
authKeys =
    [ "authorization"
    , "set-cookie"
    , "cookie"
    , "access-control-allow-origin"
    , "access-control-allow-credentials"
    , "www-authenticate"
    ]


view : String -> Decode.Value -> Html msg
view label rawValue =
    div [ class "jt-sec" ]
        [ div [ class "jt-label" ] [ text label ]
        , case Decode.decodeValue decodeJsonVal rawValue of
            Ok jsonVal ->
                div [ class "jt-tree" ] [ viewVal 0 Nothing jsonVal ]

            Err err ->
                div []
                    [ div [ class "jt-err" ] [ text "⚠ Could not decode value" ]
                    , div [ class "jt-errmsg" ] [ text (Decode.errorToString err) ]
                    ]
        ]


isBase64Url : String -> Bool
isBase64Url s =
    String.length s > 0
        && String.all (\c -> Char.isAlphaNum c || c == '-' || c == '_' || c == '=') s


isJwt : String -> Bool
isJwt s =
    let
        parts =
            String.split "." s
    in
    List.length parts == 3 && List.all isBase64Url parts


viewJwt : String -> Html msg
viewJwt jwt =
    Html.node "details"
        [ class "jwt-details" ]
        [ Html.node "summary"
            [ class "jwt-summary" ]
            [ text "JWT" ]
        , span
            [ class "jwt-pending"
            , attribute "data-jwt" jwt
            ]
            []
        ]


viewVal : Int -> Maybe String -> JsonVal -> Html msg
viewVal depth maybeKey val =
    case val of
        JString s ->
            if isJwt s then
                viewJwt s

            else
                span [ class "jt-str" ] [ text ("\"" ++ s ++ "\"") ]

        JNumber n ->
            span [ class "jt-num" ]
                [ text
                    (if n == toFloat (round n) then
                        String.fromInt (round n)

                     else
                        String.fromFloat n
                    )
                ]

        JBool b ->
            span [ class "jt-bool" ]
                [ text (if b then "true" else "false") ]

        JNull ->
            span [ class "jt-null" ] [ text "null" ]

        JArray [] ->
            span [ class "jt-punct" ] [ text "[]" ]

        JArray items ->
            div [ style "padding-left" (indentPx depth) ]
                (List.indexedMap
                    (\i item ->
                        div [ style "margin" "1px 0" ]
                            [ span [ class "jt-punct" ] [ text (String.fromInt i ++ ": ") ]
                            , viewVal (depth + 1) Nothing item
                            ]
                    )
                    items
                )

        JObject [] ->
            span [ class "jt-punct" ] [ text "{}" ]

        JObject pairs ->
            div [ style "padding-left" (indentPx depth) ]
                (List.map
                    (\( k, v ) ->
                        let
                            isAuth =
                                List.member (String.toLower k) authKeys

                            keyClass =
                                if isAuth then "jt-auth" else "jt-key"
                        in
                        div [ style "margin" "1px 0" ]
                            [ span [ class keyClass ] [ text (k ++ ": ") ]
                            , viewVal (depth + 1) (Just k) v
                            ]
                    )
                    pairs
                )


indentPx : Int -> String
indentPx depth =
    String.fromInt (depth * 14) ++ "px"
