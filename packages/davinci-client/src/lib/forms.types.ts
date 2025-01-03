export type Option = {
  label: string;
  value: string;
};

export type BaseFormField = {
  type: string;
  key?: string;
  label?: string;
  required?: boolean;
};

export type LabelField = BaseFormField & {
  type: 'LABEL';
  content: string;
};

export type ErrorDisplayField = BaseFormField & {
  type: 'ERROR_DISPLAY';
};

export type TextField = BaseFormField & {
  type: 'TEXT';
  validation?: {
    regex: string;
    errorMessage: string;
  };
};

export type PasswordField = BaseFormField & {
  type: 'PASSWORD';
};

export type SubmitButtonField = BaseFormField & {
  type: 'SUBMIT_BUTTON';
};

export type FlowLinkField = BaseFormField & {
  type: 'FLOW_LINK';
};

export type SelectableField = BaseFormField & {
  options: Option[];
  inputType: 'SINGLE_SELECT' | 'MULTI_SELECT';
};

export type DropdownField = SelectableField & {
  type: 'DROPDOWN';
};

export type ComboboxField = SelectableField & {
  type: 'COMBOBOX';
};

export type RadioField = SelectableField & {
  type: 'RADIO';
};

export type CheckboxField = SelectableField & {
  type: 'CHECKBOX';
};

export type FormField =
  | LabelField
  | ErrorDisplayField
  | TextField
  | PasswordField
  | SubmitButtonField
  | FlowLinkField
  | DropdownField
  | ComboboxField
  | RadioField
  | CheckboxField;

export type FormRequest = {
  interactionId: string;
  companyId: string;
  connectionId: string;
  connectorId: 'pingOneFormsConnector';
  id: string;
  capabilityName: 'customForm' | string;
  showContinueButton: boolean;
  components: {
    fields: FormField[];
  };
  theme: string;
  formData: {
    value: {
      [key: string]: string;
    };
  };
  returnUrl: string;
  enableRisk: boolean;
  collectBehavioralData: boolean;
  universalDeviceIdentification: boolean;
  pingidAgent: boolean;
  linkWithP1User: boolean;
  population: string;
  buttonText: string;
  authenticationMethodSource: string;
  nodeTitle: string;
  nodeDescription: string;
  backgroundColor: string;
  envId: string;
  region: string;
  themeId: string;
  formId: string;
  passwordPolicy: {
    _links: {
      environment: {
        href: string;
      };
      self: {
        href: string;
      };
    };
    id: string;
    environment: {
      id: string;
    };
    name: string;
    description: string;
    excludesProfileData: boolean;
    notSimilarToCurrent: boolean;
    excludesCommonlyUsed: boolean;
    maxAgeDays: boolean;
    minAgeDays: number;
    maxRepeatedCharacters: number;
    minUniqueCharacters: number;
    history: {
      count: number;
      retentionDays: number;
    };
    lockout: {
      failureCount: number;
      durationSeconds: number;
    };
    length: {
      min: number;
      max: number;
    };
    minCharacters: {
      '~!@#$%^&*()-_=+[]{}|;:,.<>/?': number;
      '0123456789': number;
      ABCDEFGHIJKLMNOPQRSTUVWXYZ: number;
      abcdefghijklmnopqrstuvwxyz: number;
    };
    populationCount: number;
    createdAt: string;
    updatedAt: string;
    default: boolean;
  };
  isResponseCompatibleWithMobileAndWebSdks: boolean;
  fieldTypes: string[];
  success: true;
  interactionToken: string;
  startUiSubFlow: boolean;
  _links: {
    next: {
      href: string;
    };
  };
};
