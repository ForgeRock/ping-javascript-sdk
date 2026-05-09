module JsonTree exposing (base64UrlDecode, decodeJwt, isJwt, view)

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



-- ── Pure-Elm JWT Decoder ────────────────────────────────────────────────────


{-| Base64url decode a string. Replaces URL-safe chars, pads, then uses
a pure-Elm base64 decoder (no ports needed).
-}
base64UrlDecode : String -> Maybe String
base64UrlDecode input =
    input
        |> String.replace "-" "+"
        |> String.replace "_" "/"
        |> String.replace "=" ""
        |> decodeBase64


{-| Decode a base64 string (padding already stripped) to UTF-8 text.
-}
decodeBase64 : String -> Maybe String
decodeBase64 input =
    let
        alphabet =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

        charToIndex c =
            case String.indexes (String.fromChar c) alphabet of
                [ i ] ->
                    Just i

                _ ->
                    Nothing

        chars =
            String.toList input

        indices =
            List.filterMap charToIndex chars
    in
    if List.length indices /= List.length chars then
        Nothing

    else
        Just (String.fromList (List.map Char.fromCode (decodeChunks indices [])))


decodeChunks : List Int -> List Int -> List Int
decodeChunks indices acc =
    case indices of
        a :: b :: c :: d :: rest ->
            let
                combined =
                    a * 262144 + b * 4096 + c * 64 + d

                byte1 =
                    combined // 65536 |> modBy 256

                byte2 =
                    combined // 256 |> modBy 256

                byte3 =
                    modBy 256 combined
            in
            decodeChunks rest (acc ++ [ byte1, byte2, byte3 ])

        [ a, b, c ] ->
            let
                combined =
                    a * 262144 + b * 4096 + c * 64

                byte1 =
                    combined // 65536 |> modBy 256

                byte2 =
                    combined // 256 |> modBy 256
            in
            acc ++ [ byte1, byte2 ]

        [ a, b ] ->
            let
                combined =
                    a * 262144 + b * 4096

                byte1 =
                    combined // 65536 |> modBy 256
            in
            acc ++ [ byte1 ]

        _ ->
            acc


type alias JwtDecoded =
    { header : List ( String, JsonVal )
    , payload : List ( String, JsonVal )
    , signaturePreview : String
    }


decodeJwt : String -> Maybe JwtDecoded
decodeJwt jwt =
    let
        parts =
            String.split "." jwt
    in
    case parts of
        [ headerB64, payloadB64, sig ] ->
            case ( base64UrlDecode headerB64, base64UrlDecode payloadB64 ) of
                ( Just headerJson, Just payloadJson ) ->
                    case ( Decode.decodeString (Decode.keyValuePairs decodeJsonVal) headerJson, Decode.decodeString (Decode.keyValuePairs decodeJsonVal) payloadJson ) of
                        ( Ok headerPairs, Ok payloadPairs ) ->
                            Just
                                { header = headerPairs
                                , payload = payloadPairs
                                , signaturePreview = String.left 16 sig ++ "…"
                                }

                        _ ->
                            Nothing

                _ ->
                    Nothing

        _ ->
            Nothing


viewJwt : String -> Html msg
viewJwt jwt =
    case decodeJwt jwt of
        Just decoded ->
            Html.node "details"
                [ class "jwt-details" ]
                [ Html.node "summary"
                    [ class "jwt-summary" ]
                    [ text "JWT" ]
                , div [ class "jwt-body" ]
                    [ viewJwtSection "Header" decoded.header
                    , viewJwtSection "Claims" decoded.payload
                    , div [ class "jwt-section-hdr" ] [ text "Signature" ]
                    , span [ class "jwt-sig" ] [ text (decoded.signaturePreview ++ " (not verified)") ]
                    ]
                ]

        Nothing ->
            span [ class "jt-str" ] [ text ("\"" ++ jwt ++ "\"") ]


viewJwtSection : String -> List ( String, JsonVal ) -> Html msg
viewJwtSection title pairs =
    div []
        (div [ class "jwt-section-hdr" ] [ text title ]
            :: List.map viewJwtKv pairs
        )


viewJwtKv : ( String, JsonVal ) -> Html msg
viewJwtKv ( key, val ) =
    div [ class "jwt-kv" ]
        (span [ class "jwt-k" ] [ text key ]
            :: viewJwtValue key val
        )


viewJwtValue : String -> JsonVal -> List (Html msg)
viewJwtValue key val =
    let
        isTimestamp =
            key == "exp" || key == "iat" || key == "nbf"
    in
    case val of
        JNull ->
            [ span [ class "jwt-v jwt-v-null" ] [ text "null" ] ]

        JBool b ->
            [ span [ class "jwt-v jwt-v-bool" ] [ text (if b then "true" else "false") ] ]

        JNumber n ->
            let
                numStr =
                    if n == toFloat (round n) then
                        String.fromInt (round n)

                    else
                        String.fromFloat n

                dateAnnotation =
                    if isTimestamp then
                        [ span [ class "jwt-v-date" ] [ text ("(" ++ formatUnixTime n ++ ")") ] ]

                    else
                        []

                expiredAnnotation =
                    if key == "exp" && n * 1000 < toFloat currentTimeHack then
                        [ span [ class "jwt-expired" ] [ text "⚠ EXPIRED" ] ]

                    else
                        []
            in
            span [ class "jwt-v jwt-v-num" ] [ text numStr ]
                :: dateAnnotation
                ++ expiredAnnotation

        JString s ->
            [ span [ class "jwt-v" ] [ text ("\"" ++ s ++ "\"") ] ]

        _ ->
            [ span [ class "jwt-v" ] [ text (jsonValToString val) ] ]


{-| Format a unix timestamp (seconds) to a human-readable string.
-}
formatUnixTime : Float -> String
formatUnixTime seconds =
    let
        ms =
            round (seconds * 1000)

        -- Simple ISO-ish format: we can't use Time module without Cmd,
        -- so we do a rough calculation
        totalSeconds =
            ms // 1000

        s =
            modBy 60 totalSeconds

        totalMinutes =
            totalSeconds // 60

        m =
            modBy 60 totalMinutes

        totalHours =
            totalMinutes // 60

        h =
            modBy 24 totalHours

        totalDays =
            totalHours // 24

        -- Approximate year/month/day from days since epoch
        ( year, month, day ) =
            daysToDate totalDays
    in
    String.fromInt year
        ++ "-"
        ++ padZero month
        ++ "-"
        ++ padZero day
        ++ " "
        ++ padZero h
        ++ ":"
        ++ padZero m
        ++ ":"
        ++ padZero s
        ++ " UTC"


padZero : Int -> String
padZero n =
    if n < 10 then
        "0" ++ String.fromInt n

    else
        String.fromInt n


{-| Convert days since epoch to (year, month, day). Gregorian calendar.
-}
daysToDate : Int -> ( Int, Int, Int )
daysToDate totalDays =
    let
        -- Algorithm from http://howardhinnant.github.io/date_algorithms.html
        z =
            totalDays + 719468

        era =
            (if z >= 0 then
                z

             else
                z - 146096
            )
                // 146097

        doe =
            z - era * 146097

        yoe =
            (doe - doe // 1460 + doe // 36524 - doe // 146096) // 365

        y =
            yoe + era * 400

        doy =
            doe - (365 * yoe + yoe // 4 - yoe // 100)

        mp =
            (5 * doy + 2) // 153

        d =
            doy - (153 * mp + 2) // 5 + 1

        m =
            mp
                + (if mp < 10 then
                    3

                   else
                    -9
                  )

        yr =
            y
                + (if m <= 2 then
                    1

                   else
                    0
                  )
    in
    ( yr, m, d )


{-| We can't easily get current time in a pure function, so we use a large
value that means "exp check is disabled in Elm rendering". The JS side
already handles expired token detection in the diagnosis engine.
-}
currentTimeHack : Int
currentTimeHack =
    -- This is a placeholder. In practice the exp check fires in diagnosis-engine.ts
    -- on the TypeScript side, so we don't need it here. Set to 0 to disable.
    0


jsonValToString : JsonVal -> String
jsonValToString val =
    case val of
        JString s ->
            "\"" ++ s ++ "\""

        JNumber n ->
            if n == toFloat (round n) then
                String.fromInt (round n)

            else
                String.fromFloat n

        JBool b ->
            if b then
                "true"

            else
                "false"

        JNull ->
            "null"

        JArray items ->
            "[" ++ String.join ", " (List.map jsonValToString items) ++ "]"

        JObject pairs ->
            "{" ++ String.join ", " (List.map (\( k, v ) -> "\"" ++ k ++ "\": " ++ jsonValToString v) pairs) ++ "}"



-- ── Standard JSON tree rendering ────────────────────────────────────────────


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
