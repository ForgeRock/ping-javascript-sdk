module JwtDecodeTest exposing (suite)

import Expect
import JsonTree
import Test exposing (Test, describe, test)


suite : Test
suite =
    describe "JWT decoding"
        [ test "isJwt detects valid JWT structure" <|
            \_ ->
                Expect.equal True
                    (JsonTree.isJwt "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.fakesig")
        , test "base64UrlDecode decodes a simple base64url string" <|
            \_ ->
                -- "eyJ0eXAiOiJKV1QifQ" decodes to {"typ":"JWT"}
                Expect.equal (Just "{\"typ\":\"JWT\"}")
                    (JsonTree.base64UrlDecode "eyJ0eXAiOiJKV1QifQ")
        , test "base64UrlDecode decodes JWT header" <|
            \_ ->
                Expect.equal (Just "{\"typ\":\"JWT\",\"alg\":\"RS256\"}")
                    (JsonTree.base64UrlDecode "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9")
        , test "base64UrlDecode decodes JWT payload" <|
            \_ ->
                Expect.equal (Just "{\"sub\":\"user1\",\"exp\":1778370208}")
                    (JsonTree.base64UrlDecode "eyJzdWIiOiJ1c2VyMSIsImV4cCI6MTc3ODM3MDIwOH0")
        , test "decodeJwt decodes a full JWT" <|
            \_ ->
                let
                    jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyMSIsImV4cCI6MTc3ODM3MDIwOH0.fakesig"
                    result = JsonTree.decodeJwt jwt
                in
                case result of
                    Just decoded ->
                        Expect.equal "fakesig…" decoded.signaturePreview

                    Nothing ->
                        Expect.fail "decodeJwt returned Nothing"
        ]
