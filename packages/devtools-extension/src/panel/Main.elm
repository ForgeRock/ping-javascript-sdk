port module Main exposing (main)

import Browser
import Decode
import Helpers
import Json.Decode as JD
import Time
import Model exposing (init)
import Types exposing (InspectorTab(..))
import Update exposing (Msg(..), update)
import View exposing (view)


main : Program () Model.Model Msg
main =
    Browser.element
        { init = init
        , update = updateWithPorts
        , view = view
        , subscriptions = subscriptions
        }


updateWithPorts : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
updateWithPorts msg model =
    let
        ( newModel, cmd ) =
            update msg model
    in
    case msg of
        ExportJson ->
            ( newModel, Cmd.batch [ cmd, exportJson () ] )

        ExportMarkdown ->
            ( newModel, Cmd.batch [ cmd, exportMarkdown () ] )

        SubmitImportPaste ->
            ( newModel, Cmd.batch [ cmd, submitImportPaste model.importPasteText ] )

        ClearFlow ->
            ( newModel, Cmd.batch [ cmd, clearFlow () ] )

        SaveSnapshot ->
            ( newModel, Cmd.batch [ cmd, saveSnapshot () ] )

        CopyToClipboard text ->
            ( newModel, Cmd.batch [ cmd, copyToClipboard text ] )

        ToggleSnapshotMenu ->
            if not model.snapshotMenuOpen then
                -- Opening: request fresh list
                ( newModel, Cmd.batch [ cmd, requestSnapshots () ] )
            else
                ( newModel, cmd )

        LoadSnapshot snapshotId ->
            ( newModel, Cmd.batch [ cmd, loadSnapshot snapshotId ] )

        DeleteSnapshot snapshotId ->
            ( newModel, Cmd.batch [ cmd, deleteSnapshot snapshotId ] )

        _ ->
            ( newModel, cmd )


subscriptions : Model.Model -> Sub Msg
subscriptions model =
    let
        playbackSub =
            if model.isPlaying then
                let
                    sdkNodes =
                        Helpers.sdkNodes model.events

                    currentNode =
                        model.playbackIndex
                            |> Maybe.andThen (\n -> List.head (List.drop n sdkNodes))

                    nextNode =
                        model.playbackIndex
                            |> Maybe.andThen (\n -> List.head (List.drop (n + 1) sdkNodes))

                    interval =
                        case ( currentNode, nextNode ) of
                            ( Just cur, Just nxt ) ->
                                clamp 300.0 1500.0 (nxt.timestamp - cur.timestamp)

                            _ ->
                                600.0
                in
                Time.every interval (\_ -> PlaybackTick)

            else
                Sub.none
    in
    Sub.batch
        [ receiveEvent
            (\raw ->
                case JD.decodeValue Decode.decodeAuthEvent raw of
                    Ok event ->
                        EventReceived event

                    Err err ->
                        DecodeError (JD.errorToString err)
            )
        , receiveDiagnosis
            (\raw ->
                case JD.decodeValue Decode.decodeDiagnosisResult raw of
                    Ok result ->
                        DiagnosisReceived result

                    Err err ->
                        DecodeError ("Diagnosis decode failed: " ++ JD.errorToString err)
            )
        , receiveImportMeta
            (\raw ->
                case JD.decodeValue Decode.decodeImportMeta raw of
                    Ok meta ->
                        ImportMetaReceived meta

                    Err err ->
                        ImportError ("Import meta decode failed: " ++ JD.errorToString err)
            )
        , receiveImportError
            (\raw ->
                case JD.decodeValue (JD.field "message" JD.string) raw of
                    Ok errMsg ->
                        ImportError errMsg

                    Err err ->
                        ImportError ("Unknown import error: " ++ JD.errorToString err)
            )
        , receiveSnapshots
            (\raw ->
                case JD.decodeValue (JD.list Decode.decodeSnapshotMeta) raw of
                    Ok list ->
                        SnapshotsReceived list

                    Err err ->
                        DecodeError ("Snapshots decode failed: " ++ JD.errorToString err)
            )
        , playbackSub
        ]


port receiveEvent : (JD.Value -> msg) -> Sub msg


port receiveDiagnosis : (JD.Value -> msg) -> Sub msg


port receiveImportMeta : (JD.Value -> msg) -> Sub msg


port receiveImportError : (JD.Value -> msg) -> Sub msg


port exportJson : () -> Cmd msg


port exportMarkdown : () -> Cmd msg


port submitImportPaste : String -> Cmd msg


port clearFlow : () -> Cmd msg


port saveSnapshot : () -> Cmd msg


port copyToClipboard : String -> Cmd msg


port requestSnapshots : () -> Cmd msg


port receiveSnapshots : (JD.Value -> msg) -> Sub msg


port loadSnapshot : String -> Cmd msg


port deleteSnapshot : String -> Cmd msg
