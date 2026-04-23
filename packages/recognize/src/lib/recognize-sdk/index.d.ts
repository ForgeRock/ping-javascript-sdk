import type { AnimationPlaybackControlsWithThen } from 'motion';
import { AracnaBaseElement } from '@aracna/web-components/elements/core/base-element';
import type { AracnaBaseElementAttributes } from '@aracna/web-components';
import type { AracnaBaseElementEventMap } from '@aracna/web-components';
import { AracnaButtonElement } from '@aracna/web-components/elements/input/button-element';
import type { AracnaButtonElementEventMap } from '@aracna/web-components';
import { AracnaDialogElement } from '@aracna/web-components/elements/feedback/dialog-element';
import type { AracnaDialogElementAttributes } from '@aracna/web-components';
import type { AracnaDialogElementEventMap } from '@aracna/web-components';
import { AracnaIconElement } from '@aracna/web-components/elements/data/icon-element';
import { AracnaQrCodeElement } from '@aracna/web-components/elements/data/qr-code-element';
import type { AracnaQrCodeElementAttributes } from '@aracna/web-components';
import type { AracnaQrCodeElementEventMap } from '@aracna/web-components';
import { AracnaSelectButtonElement } from '@aracna/web-components/elements/input/select-element';
import { AracnaSelectButtonElementEventMap } from '@aracna/web-components';
import { AracnaSelectOptionElement } from '@aracna/web-components/elements/input/select-element';
import { AracnaTextElement } from '@aracna/web-components/elements/typography/text-element';
import type { AracnaTextElementAttributes } from '@aracna/web-components';
import type { AracnaTextElementEventMap } from '@aracna/web-components';
import { CreateKeylessMediaStreamArgs } from '@keyless/sdk-web';
import { CSSResultGroup } from 'lit';
import { FormControlChangeEvent } from '@aracna/web-components';
import { IResult } from '@ua-parser-js/pro-enterprise';
import type { KeylessBiometricFilters } from '@keyless/sdk-web';
import { KeylessMediaDevice } from '@keyless/sdk-web';
import { KeylessSessionType } from '@keyless/sdk-web';
import { KeylessVideoFrameQuality } from '@keyless/sdk-web';
import { KeylessVideoFrameQualityFilter } from '@keyless/sdk-web';
import { KeylessWebSocketCloseEvent as KeylessWebSocketCloseEvent_2 } from '@keyless/sdk-web';
import { KeylessWebSocketMessageEvent } from '@keyless/sdk-web';
import { KeylessWebSocketOpenEvent as KeylessWebSocketOpenEvent_2 } from '@keyless/sdk-web';
import { LocalizationPack } from '@aracna/core';
import { LocalizationVariables } from '@aracna/core';
import { LoggerLevel } from '@aracna/core';
import { nothing } from 'lit';
import { PropertyDeclarations } from 'lit';
import { QueryDeclarations } from '@aracna/web-components';
import { ReactiveController } from 'lit';
import { ReactiveControllerHost } from 'lit';
import { TemplateResult } from 'lit';
import { Theme } from '@aracna/core';

/** @public */
declare class _ extends ErrorEvent {
    reason?: string;
    constructor(type: string, eventInitDict?: ErrorEventInit, reason?: string);
}

/** @public */
export declare const DEFAULT_KEYLESS_LOCALIZATION_LANGUAGE: string;

/** @internal */
declare interface Element_2 extends HTMLElement {
    theme?: Theme;
}

/** @internal */
declare interface Element_3 extends HTMLElement {
    localizationPacks?: LocalizationPack[];
    localizationVariables?: LocalizationVariables;
}

/** @internal */
declare interface Element_4 extends HTMLElement {
    disableLogger?: boolean;
    loggerLevel?: LoggerLevel;
}

/** @internal */
declare interface Element_5 extends HTMLElement {
    step: KeylessComponentsStep;
}

/** @public */
export declare const KEYLESS_COMPONENTS_VERSION: string;

/** @public */
export declare class KeylessAppearanceController implements ReactiveController {
    private host;
    constructor(host: ReactiveControllerHost & Element_2);
    hostConnected(): Promise<void>;
    hostUpdate(): void;
    setAttributes(): void;
}

/** @public */
export declare class KeylessAuthElement extends RootElement {
    get slug(): KeylessElementSlug;
}

/** @public */
export declare interface KeylessAuthElementAttributes extends RootElementAttributes {
}

/** @public */
export declare interface KeylessAuthElementEventMap extends RootElementEventMap {
}

/** @public */
export declare class KeylessBeginStreamEvent extends CustomEvent<{}> {
    constructor();
}

/** @public */
export declare class KeylessButtonElement extends AracnaButtonElement {
    protected appearanceController: KeylessAppearanceController;
    /**
     * Properties
     */
    /** */
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    render(): TemplateResult<1>;
    get slug(): any;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    static deps: KeylessDependencyDeclarations;
    static properties: PropertyDeclarations;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessButtonElementAttributes extends AracnaBaseElementAttributes {
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
}

/** @public */
export declare interface KeylessButtonElementEventMap extends AracnaButtonElementEventMap {
}

/** @public */
export declare class KeylessCameraBiometricElement extends KeylessCameraElement {
    connectedCallback(): void;
    disconnectedCallback(): void;
    get slug(): any;
}

/** @public */
export declare interface KeylessCameraBiometricElementAttributes extends KeylessCameraElementAttributes {
}

/** @public */
export declare interface KeylessCameraBiometricElementEventMap extends KeylessCameraElementEventMap {
}

/** @public */
export declare class KeylessCameraCornersElement extends AracnaBaseElement {
    appearanceController: KeylessAppearanceController;
    /**
     * Properties
     */
    /** */
    disableAnimation?: boolean;
    hasFrameResults?: boolean;
    hasTriggeredBiometricFilters?: boolean;
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    /**
     * State
     */
    /** */
    cornerSize: number;
    /**
     * Internal
     */
    /** */
    protected animationControls?: AnimationPlaybackControlsWithThen;
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(name: string, _old: string | null, value: string | null): void;
    handleAnimation(): void;
    render(): TemplateResult<1>;
    get corners(): string[];
    get slug(): any;
    get styleHTML(): TemplateResult;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    get hasFrameResultsWithEmptyFilters(): boolean;
    get isAnimatable(): boolean;
    static properties: PropertyDeclarations;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessCameraCornersElementAttributes extends AracnaBaseElementAttributes {
    'corner-size'?: number;
    'disable-animation'?: boolean;
    'has-frame-results'?: boolean;
    'has-triggered-biometric-filters'?: any[];
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
}

/** @public */
export declare interface KeylessCameraCornersElementEventMap extends AracnaBaseElementEventMap {
}

/** @public */
export declare class KeylessCameraElement extends AracnaBaseElement {
    appearanceController: KeylessAppearanceController;
    loggerController: KeylessLoggerController;
    /**
     * Properties
     */
    /** */
    protected _aspectRatio?: number | string;
    disableLogger?: boolean;
    enableFlash?: boolean;
    loggerLevel?: LoggerLevel;
    scale?: number;
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    constructor();
    render(): TemplateResult;
    get aspectRatio(): number | string | undefined;
    set aspectRatio(aspectRatio: number | string);
    get slug(): any;
    get styleHTML(): TemplateResult;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    static properties: PropertyDeclarations;
    static queries: QueryDeclarations;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessCameraElementAttributes extends AracnaBaseElementAttributes {
    'aspect-ratio'?: number | string;
    'disable-logger'?: boolean;
    'enable-flash'?: boolean;
    'logger-level'?: LoggerLevel;
    scale?: number;
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
}

/** @public */
export declare interface KeylessCameraElementEventMap extends AracnaBaseElementEventMap {
    'camera-play': KeylessCameraPlayEvent;
}

/** @public */
export declare interface KeylessCameraFlashOverlayElementEventMap extends AracnaBaseElementEventMap {
}

/** @public */
export declare class KeylessCameraInstructionsElement extends AracnaBaseElement {
    appearanceController: KeylessAppearanceController;
    localizationController: KeylessLocalizationController;
    /**
     * Properties
     */
    /** */
    enableIcons: boolean;
    localizationPacks?: LocalizationPack[];
    localizationVariables?: LocalizationVariables;
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    render(): TemplateResult<1>;
    get slug(): any;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    static deps: KeylessDependencyDeclarations;
    static properties: PropertyDeclarations;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessCameraInstructionsElementAttributes extends AracnaBaseElementAttributes {
    'enable-icons'?: boolean;
    lang?: string;
    'localization-packs'?: LocalizationPack[];
    'localization-variables'?: LocalizationVariables;
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
}

/** @public */
export declare interface KeylessCameraInstructionsElementEventMap extends AracnaBaseElementEventMap {
}

/** @public */
export declare class KeylessCameraPauseEvent extends CustomEvent<{}> {
    constructor();
}

/** @public */
export declare class KeylessCameraPlayEvent extends CustomEvent<{}> {
    constructor();
}

/** @public */
export declare class KeylessCameraSelectElement extends AracnaBaseElement {
    appearanceController: KeylessAppearanceController;
    localizationController: KeylessLocalizationController;
    loggerController: KeylessLoggerController;
    /**
     * Properties
     */
    /** */
    disableLogger?: boolean;
    expanded?: boolean;
    localizationPacks?: LocalizationPack[];
    localizationVariables?: LocalizationVariables;
    loggerLevel?: LoggerLevel;
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    /**
     * State
     */
    /** */
    protected defaultDeviceID?: string;
    protected deviceLabel?: string;
    protected devices: KeylessMediaDevice[];
    /**
     * Queries
     */
    /** */
    protected selectButton: AracnaSelectButtonElement<AracnaSelectButtonElementEventMap>;
    protected selectOptions: AracnaSelectOptionElement[];
    constructor();
    connectedCallback(): void;
    onSelectChange: (event: FormControlChangeEvent<string>) => void;
    isDeviceActive(device: KeylessMediaDevice): boolean;
    render(): TemplateResult<1> | typeof nothing;
    get slug(): any;
    get styleHTML(): TemplateResult;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    get ua(): IResult;
    static deps: KeylessDependencyDeclarations;
    static properties: PropertyDeclarations;
    static queries: QueryDeclarations;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessCameraSelectElementAttributes extends AracnaBaseElementAttributes {
    'disable-logger'?: boolean;
    expanded?: boolean;
    lang?: string;
    'localization-packs'?: LocalizationPack[];
    'localization-variables'?: LocalizationVariables;
    'logger-level'?: LoggerLevel;
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
}

/** @public */
export declare interface KeylessCameraSelectElementEventMap extends KeylessCameraElementEventMap {
    'device-change': KeylessDeviceChangeEvent;
}

/** @public */
export declare class KeylessCompleteEvent extends CustomEvent<{}> {
    constructor();
}

/** @public */
export declare enum KeylessComponentsError {
    QUEUE_UNSET = "QUEUE_UNSET",
    SYMBOL_UNSET = "SYMBOL_UNSET",
    NONCANCELABLE = "NONCANCELABLE"
}

/** @public */
export declare type KeylessComponentsStep = 'bootstrap' | 'done' | 'error' | 'camera-permission' | 'camera-selection' | 'camera-instructions' | 'camera-stream-boot' | 'camera-stream' | 'server-computation' | 'stm-choice' | 'stm-qrcode' | 'microphone-permission';

/** @public */
export declare type KeylessDependencyDeclarations = (typeof HTMLElement)[];

/** @public */
export declare class KeylessDeviceChangeEvent extends CustomEvent<KeylessDeviceChangeEventDetail> {
    constructor(label?: string);
}

/** @public */
export declare interface KeylessDeviceChangeEventDetail {
    label?: string;
}

/** @public */
export declare class KeylessDialogElement extends AracnaDialogElement {
    appearanceController: KeylessAppearanceController;
    /**
     * Properties
     */
    /** */
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    /**
     * Queries
     */
    /** */
    authElement?: RootElement;
    enrollElement?: RootElement;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected onClose(): void;
    render(): TemplateResult<1>;
    get styleHTML(): TemplateResult;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    static queries: QueryDeclarations;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessDialogElementAttributes extends AracnaDialogElementAttributes {
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
}

/** @public */
export declare interface KeylessDialogElementEventMap extends AracnaDialogElementEventMap {
}

/** @public */
export declare enum KeylessElementSlug {
    AUTH = "auth",
    AUTH_DIALOG = "auth-dialog",
    BUTTON = "button",
    CAMERA = "camera",
    CAMERA_BACKDROP = "camera-backdrop",
    CAMERA_BIOMETRIC = "camera-biometric",
    CAMERA_FLASH_OVERLAY = "camera-flash-overlay",
    CAMERA_CORNERS = "camera-corners",
    CAMERA_INSTRUCTIONS = "camera-instructions",
    CAMERA_SELECT = "camera-select",
    ENROLL = "enroll",
    ENROLL_DIALOG = "enroll-dialog",
    FACE_SCAN = "face-scan",
    POWERED_BY = "powered-by",
    ROOT = "root",
    SHADED_ICON = "shaded-icon",
    SPINNER = "spinner",
    TEXT = "text"
}

/** @public */
export declare class KeylessEnrollElement extends RootElement {
    get slug(): KeylessElementSlug;
}

/** @public */
export declare interface KeylessEnrollElementAttributes extends RootElementAttributes {
}

/** @public */
export declare interface KeylessEnrollElementEventMap extends RootElementEventMap {
}

/** @public */
export declare class KeylessFaceScanElement extends AracnaBaseElement {
    appearanceController: KeylessAppearanceController;
    /**
     * Properties
     */
    /** */
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    /**
     * Queries
     */
    /** */
    innerLinesElement: AracnaIconElement;
    innerLinesYellowElement: AracnaIconElement;
    outerLinesElement: AracnaIconElement;
    scannerElement: HTMLDivElement;
    scannerGradientBottomElement: HTMLDivElement;
    scannerGradientTopElement: HTMLDivElement;
    connectedCallback(): void;
    handleAnimation(): void;
    render(): TemplateResult<1>;
    get innerLinesSize(): number;
    get innerLinesGroupSize(): number;
    get outerLinesSize(): number;
    get slug(): any;
    get styleHTML(): TemplateResult;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    static deps: KeylessDependencyDeclarations;
    static properties: PropertyDeclarations;
    static queries: QueryDeclarations;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessFaceScanElementAttributes extends AracnaBaseElementAttributes {
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
}

/** @public */
export declare interface KeylessFaceScanElementEventMap extends AracnaBaseElementEventMap {
}

/** @public */
export declare class KeylessFinishedEvent extends CustomEvent<KeylessFinishedEventDetail> {
    constructor(customer: string, type: KeylessSessionType, username: string, seedEntropy?: Uint8Array<ArrayBuffer>, transactionJWT?: string);
}

/** @public */
export declare interface KeylessFinishedEventDetail {
    customer: string;
    seedEntropy?: Uint8Array<ArrayBuffer>;
    source: KeylessSessionSource;
    transactionJWT?: string;
    type: KeylessSessionType;
    username: string;
}

/** @public */
export declare class KeylessFrameResultsEvent extends CustomEvent<KeylessFrameResultsEventDetail> {
    constructor(filters: any, timestamp: Date);
}

/** @public */
export declare interface KeylessFrameResultsEventDetail {
    filters: KeylessBiometricFilters;
    timestamp: Date;
}

/** @public */
export declare class KeylessLocalizationController implements ReactiveController {
    private host;
    constructor(host: ReactiveControllerHost & Element_3);
    hostConnected(): Promise<void>;
    hostUpdate(): void;
    get language(): string;
}

/** @public */
export declare class KeylessLoggerController implements ReactiveController {
    private host;
    constructor(host: ReactiveControllerHost & Element_4);
    hostConnected(): Promise<void>;
    hostUpdate(): void;
}

/** @public */
export declare class KeylessPoweredByElement extends AracnaBaseElement {
    appearanceController: KeylessAppearanceController;
    /**
     * Properties
     */
    /** */
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    render(): TemplateResult<1>;
    get slug(): any;
    get styleHTML(): TemplateResult;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    static deps: KeylessDependencyDeclarations;
    static properties: PropertyDeclarations;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessPoweredByElementAttributes extends AracnaBaseElementAttributes {
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
}

/** @public */
export declare interface KeylessPoweredByElementEventMap extends AracnaBaseElementEventMap {
}

/** @public */
export declare class KeylessQrCodeElement extends AracnaQrCodeElement {
    appearanceController: KeylessAppearanceController;
    /**
     * Properties
     */
    /** */
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    render(): TemplateResult<1>;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessQrCodeElementAttributes extends AracnaQrCodeElementAttributes {
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
}

/** @public */
export declare interface KeylessQrCodeElementEventMap extends AracnaQrCodeElementEventMap {
}

/** @public */
export declare type KeylessSessionSource = 'qrcode' | 'url';

/** @public */
export declare class KeylessShadedIconElement extends AracnaBaseElement {
    protected appearanceController: KeylessAppearanceController;
    /**
     * Properties
     */
    /** */
    src: string;
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    variant: KeylessShadedIconVariant;
    render(): TemplateResult<1>;
    get slug(): any;
    get styleHTML(): TemplateResult<1>;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    static deps: KeylessDependencyDeclarations;
    static properties: PropertyDeclarations;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessShadedIconElementAttributes extends AracnaBaseElementAttributes {
    src?: string;
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
    variant?: 'primary' | 'error';
}

/** @public */
export declare interface KeylessShadedIconElementEventMap extends AracnaBaseElementEventMap {
}

/** @public */
export declare type KeylessShadedIconVariant = 'primary' | 'error';

/** @public */
export declare class KeylessSpinnerElement extends AracnaBaseElement {
    protected appearanceController: KeylessAppearanceController;
    /**
     * Properties
     */
    /** */
    theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    get slug(): any;
    get styleHTML(): TemplateResult<1>;
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    static properties: PropertyDeclarations;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessSpinnerElementAttributes extends AracnaBaseElementAttributes {
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
}

/** @public */
export declare interface KeylessSpinnerElementEventMap extends AracnaBaseElementEventMap {
}

/** @public */
export declare class KeylessStepChangeEvent extends CustomEvent<KeylessStepChangeEventDetail> {
    constructor(step: KeylessComponentsStep);
}

/** @public */
export declare interface KeylessStepChangeEventDetail {
    step: KeylessComponentsStep;
}

/** @public */
export declare class KeylessStepController implements ReactiveController {
    protected host: ReactiveControllerHost & Element_5;
    constructor(host: ReactiveControllerHost & Element_5);
    hostConnected(): void;
    hostUpdate(): void;
    setAttributes(): void;
}

/** @public */
export declare class KeylessStopStreamEvent extends CustomEvent<{}> {
    constructor();
}

/** @public */
export declare class KeylessTextElement extends AracnaTextElement {
    get slug(): any;
    static styles: CSSResultGroup;
}

/** @public */
export declare interface KeylessTextElementAttributes extends AracnaTextElementAttributes {
}

/** @public */
export declare interface KeylessTextElementEventMap extends AracnaTextElementEventMap {
}

/** @public */
export declare interface KeylessThemeOptions {
    colors: KeylessThemeOptionsColors;
    elements: KeylessThemeOptionsElements;
}

/** @public */
export declare interface KeylessThemeOptionsColors {
    dark: KeylessThemeOptionsColorsValue;
    light: KeylessThemeOptionsColorsValue;
}

/** @public */
export declare interface KeylessThemeOptionsColorsValue {
    primary: string;
    onPrimary: string;
    secondary: string;
    onSecondary: string;
    error: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    surface: string;
    onSurface: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
}

/** @public */
export declare interface KeylessThemeOptionsElements {
    button: KeylessThemeOptionsElementsButton;
    camera: KeylessThemeOptionsElementsCamera;
    cameraCorners: KeylessThemeOptionsElementsCameraCorners;
    cameraInstructions: KeylessThemeOptionsElementsCameraInstructions;
    cameraSelect: KeylessThemeOptionsElementsCameraSelect;
    dialog: KeylessThemeOptionsElementsDialog;
    poweredBy: KeylessThemeOptionsElementsPoweredBy;
    qrcode: KeylessThemeOptionsElementsQrcode;
    root: KeylessThemeOptionsElementsRoot;
}

/** @public */
export declare interface KeylessThemeOptionsElementsButton {
    host: KeylessThemeOptionsElementsButtonHost;
    size: KeylessThemeOptionsElementsButtonSize;
    variant: KeylessThemeOptionsElementsButtonVariant;
}

/** @public */
export declare interface KeylessThemeOptionsElementsButtonHost {
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    padding: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsButtonSize {
    small: KeylessThemeOptionsElementsButtonSizeSmall;
}

/** @public */
export declare interface KeylessThemeOptionsElementsButtonSizeSmall {
    host: KeylessThemeOptionsElementsButtonSizeSmallHost;
}

/** @public */
export declare interface KeylessThemeOptionsElementsButtonSizeSmallHost {
    fontSize: string;
    padding: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsButtonVariant {
    text: KeylessThemeOptionsElementsButtonVariantText;
}

/** @public */
export declare interface KeylessThemeOptionsElementsButtonVariantText {
    host: KeylessThemeOptionsElementsButtonVariantTextHost;
}

/** @public */
export declare interface KeylessThemeOptionsElementsButtonVariantTextHost {
    borderBottom: string;
    hover: KeylessThemeOptionsElementsButtonVariantTextHostHover;
}

/** @public */
export declare interface KeylessThemeOptionsElementsButtonVariantTextHostHover {
    opacity: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCamera {
    host: KeylessThemeOptionsElementsCameraHost;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraCorners {
    svg: KeylessThemeOptionsElementsCameraCornersSvg;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraCornersSvg {
    strokeWidth: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraHost {
    after: KeylessThemeOptionsElementsCameraHostAfter;
    before: KeylessThemeOptionsElementsCameraHostBefore;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraHostAfter {
    background: string;
    height: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraHostBefore {
    background: string;
    height: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraInstructions {
    host: KeylessThemeOptionsElementsCameraInstructionsHost;
    li: KeylessThemeOptionsElementsCameraInstructionsLi;
    liText: KeylessThemeOptionsElementsCameraInstructionsLiText;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraInstructionsHost {
    gap: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraInstructionsLi {
    borderRadius: string;
    gap: string;
    padding: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraInstructionsLiText {
    fontSize: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraSelect {
    labels: KeylessThemeOptionsElementsCameraSelectLabels;
    labelsHeadline: KeylessThemeOptionsElementsCameraSelectLabelsHeadline;
    labelsText: KeylessThemeOptionsElementsCameraSelectLabelsText;
    list: KeylessThemeOptionsElementsCameraSelectList;
    option: KeylessThemeOptionsElementsCameraSelectOption;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraSelectLabels {
    gap: string;
    padding: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraSelectLabelsHeadline {
    fontSize: string;
    fontWeight: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraSelectLabelsText {
    fontSize: string;
    fontWeight: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraSelectList {
    borderRadius: string;
    margin: string;
    padding: string;
    top: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsCameraSelectOption {
    borderRadius: string;
    marginTop: string;
    padding: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsDialog {
    host: KeylessThemeOptionsElementsDialogHost;
}

/** @public */
export declare interface KeylessThemeOptionsElementsDialogHost {
    border: string;
    borderRadius: string;
    boxShadow: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsFaceScanCorners {
    strokeWidth: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsFaceScanHost {
    borderRadius?: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsFaceScanScanLine {
    height: string;
    animationDuration?: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsFaceScanTransitions {
    borderFade?: string;
    wireframeFade?: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsFaceScanWireframe {
    opacity: string;
    animationDuration?: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsPoweredBy {
    host: KeylessThemeOptionsElementsPoweredByHost;
    icon: KeylessThemeOptionsElementsPoweredByIcon;
    span: KeylessThemeOptionsElementsPoweredBySpan;
}

/** @public */
export declare interface KeylessThemeOptionsElementsPoweredByHost {
    gap: string;
    height: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsPoweredByIcon {
    height: string;
    width: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsPoweredBySpan {
    fontSize: string;
    fontWeight: string;
    letterSpacing: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsQrcode {
    host: KeylessThemeOptionsElementsQrcodeHost;
}

/** @public */
export declare interface KeylessThemeOptionsElementsQrcodeHost {
    borderRadius: string;
    padding: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRoot {
    buttonCameraSelect: KeylessThemeOptionsElementsRootButtonCameraSelect;
    buttonCancel: KeylessThemeOptionsElementsRootButtonCancel;
    buttonClose: KeylessThemeOptionsElementsRootButtonClose;
    buttonFlash: KeylessThemeOptionsElementsRootButtonFlash;
    buttonPin: KeylessThemeOptionsElementsRootButtonPin;
    buttonsSwitchToMobileChoice: KeylessThemeOptionsElementsRootButtonsSwitchToMobileChoice;
    cameraBiometric: KeylessThemeOptionsElementsRootCameraBiometric;
    cameraTip: KeylessThemeOptionsElementsRootCameraTip;
    headline: KeylessThemeOptionsElementsRootHeadline;
    host: KeylessThemeOptionsElementsRootHost;
    poweredBy: KeylessThemeOptionsElementsRootPoweredBy;
    text: KeylessThemeOptionsElementsRootText;
    texts: KeylessThemeOptionsElementsRootTexts;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootButtonCameraSelect {
    right: string;
    top: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootButtonCancel {
    left: string;
    top: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootButtonClose {
    left: string;
    top: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootButtonFlash {
    right: string;
    top: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootButtonPin {
    height: string;
    width: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootButtonsSwitchToMobileChoice {
    gap: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootCameraBiometric {
    width: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootCameraTip {
    backdropFilter: string;
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    height: string;
    padding: string;
    top: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootHeadline {
    fontSize: string;
    fontWeight: string;
    marginTop: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootHost {
    borderRadius: string;
    gap: string;
    padding: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootPoweredBy {
    bottom: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootText {
    fontSize: string;
    fontWeight: string;
}

/** @public */
export declare interface KeylessThemeOptionsElementsRootTexts {
    gap: string;
}

/** @public */
export declare class KeylessVideoFrameQualityEvent extends CustomEvent<KeylessVideoFrameQualityEventDetail> {
    constructor(filters: KeylessVideoFrameQualityFilter[], timestamp: number);
}

/** @public */
export declare interface KeylessVideoFrameQualityEventDetail {
    filters: KeylessVideoFrameQualityFilter[];
    timestamp: Date;
}

/** @public */
export declare class KeylessWebSocketCloseEvent extends CustomEvent<KeylessWebSocketCloseEventDetail> {
    constructor(event: KeylessWebSocketCloseEvent_2);
}

/** @public */
export declare interface KeylessWebSocketCloseEventDetail {
    code: number;
    reason: string;
}

/** @public */
export declare class KeylessWebSocketOpenEvent extends CustomEvent<KeylessWebSocketOpenEventDetail> {
    constructor(event: KeylessWebSocketOpenEvent_2);
}

/** @public */
export declare interface KeylessWebSocketOpenEventDetail {
    event: KeylessWebSocketOpenEvent_2;
}

/** @internal */
declare class RootElement extends AracnaBaseElement {
    appearanceController: KeylessAppearanceController;
    localizationController: KeylessLocalizationController;
    loggerController: KeylessLoggerController;
    stepController: KeylessStepController;
    /**
     * Properties
     */
    /** */
    aspectRatio?: number | string;
    authorizationToken?: string;
    cameraAspectRatio?: number | string;
    customer: string;
    datadogEnv?: string;
    datadogToken?: string;
    disableDatadog?: boolean;
    disableLogger?: boolean;
    disablePoweredBy?: boolean;
    disableSteps?: KeylessComponentsStep[];
    enableCameraFlash?: boolean;
    enableCameraInstructions?: boolean;
    enableCameraInstructionsIcons?: boolean;
    enableCloseButton?: boolean;
    enableDatadogPII?: boolean;
    enableSwitchToMobile?: boolean;
    enableWasmPthreads?: boolean;
    key: string;
    keyID: string;
    localizationPacks?: LocalizationPack[];
    localizationVariables?: LocalizationVariables;
    loggerLevel?: LoggerLevel;
    operationID?: string;
    publicKey: string;
    seedEntropy?: boolean;
    switchToMobileBaseURL?: string;
    protected _theme?: Theme;
    protected _themeOptions?: KeylessThemeOptions;
    protected _transactionData?: string;
    protected _username: string;
    wasmBinaryURL?: string;
    wasmDataURL?: string;
    /**
     * @deprecated The `wasmFileURL` property is deprecated and will be removed in a future release. Please use `wasmBinaryURL` instead.
     */
    wasmFileURL?: string;
    wasmScriptURL?: string;
    wsTimeout?: number;
    wsURL: string;
    /**
     * State
     */
    /** */
    error?: Error;
    hasMultipleVideoMediaDevices: boolean;
    serverFrameResults?: KeylessWebSocketMessageEvent;
    protected _step: KeylessComponentsStep;
    switchToMobileUrlCopied: boolean;
    videoFrameQuality?: KeylessVideoFrameQuality;
    constructor();
    attributeChangedCallback(name: string, _old: string | null, value: string | null): void;
    connectedCallback(): void;
    render(): TemplateResult<1>;
    get numericSize(): number;
    get slug(): KeylessElementSlug;
    get step(): KeylessComponentsStep;
    set step(value: KeylessComponentsStep);
    get theme(): Theme | undefined;
    set theme(value: Theme | undefined);
    get themeOptions(): KeylessThemeOptions | undefined;
    set themeOptions(options: KeylessThemeOptions | undefined);
    get transactionData(): string | undefined;
    set transactionData(value: string | undefined);
    get username(): string;
    set username(value: string);
    get version(): string;
    static deps: KeylessDependencyDeclarations;
    static properties: PropertyDeclarations;
    static styles: CSSResultGroup;
}

/** @internal */
declare interface RootElementAttributes extends AracnaBaseElementAttributes {
    'aspect-ratio'?: number | string;
    'authorization-token'?: string;
    'camera-aspect-ratio'?: number | string;
    customer: string;
    'datadog-env'?: string;
    'datadog-token'?: string;
    'disable-datadog'?: boolean;
    'disable-logger'?: boolean;
    'disable-powered-by'?: boolean;
    'disable-steps'?: KeylessComponentsStep[];
    'enable-camera-flash'?: boolean;
    'enable-camera-instructions'?: boolean;
    'enable-camera-instructions-icons'?: boolean;
    'enable-close-button'?: boolean;
    'enable-datadog-pii'?: boolean;
    'enable-switch-to-mobile'?: boolean;
    'enable-wasm-pthreads'?: boolean;
    key?: string;
    'key-id': string;
    lang?: string;
    'localization-packs'?: LocalizationPack[];
    'localization-variables'?: LocalizationVariables;
    'logger-level'?: LoggerLevel;
    'operation-id'?: string;
    'public-key'?: string;
    'seed-entropy'?: boolean;
    'switch-to-mobile-base-url'?: string;
    theme?: Theme;
    'theme-options'?: KeylessThemeOptions;
    'transaction-data'?: string;
    username: string;
    'wasm-binary-url'?: string;
    'wasm-data-url'?: string;
    /**
     * @deprecated The `wasm-file-url` attribute is deprecated and will be removed in a future release. Please use `wasm-binary-url` instead.
     */
    'wasm-file-url'?: string;
    'wasm-script-url'?: string;
    'ws-timeout'?: number;
    'ws-url': string;
}

/** @internal */
declare interface RootElementEventMap extends AracnaBaseElementEventMap {
    'begin-stream': KeylessBeginStreamEvent;
    close: Event;
    error: _;
    finished: KeylessFinishedEvent;
    'frame-results': KeylessFrameResultsEvent;
    'step-change': KeylessStepChangeEvent;
    'stop-stream': KeylessStopStreamEvent;
    'video-frame-quality': KeylessVideoFrameQualityEvent;
    'ws-close': KeylessWebSocketCloseEvent;
    'ws-open': KeylessWebSocketOpenEvent;
}

/** @public */
export declare function setKeylessCreateMediaStreamArgs(element: RootElement, args: CreateKeylessMediaStreamArgs): void | Error;

export { }
