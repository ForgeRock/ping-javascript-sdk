import { Schema } from 'effect';

export const CreateUserRequestBody = Schema.Struct({
  email: Schema.String,
  name: Schema.Struct({ given: Schema.String, family: Schema.String }),
  population: Schema.Struct({ id: Schema.String }),
  username: Schema.String,
  department: Schema.String,
  locales: Schema.Array(Schema.String),
});

export const CreateUserResponse = Schema.Struct({
  _links: Schema.Struct({
    self: Schema.Struct({
      href: Schema.String,
    }),
    environment: Schema.Struct({
      href: Schema.String,
    }),
    population: Schema.Struct({
      href: Schema.String,
    }),
    devices: Schema.Struct({
      href: Schema.String,
    }),
    roleAssignments: Schema.Struct({
      href: Schema.String,
    }),
    password: Schema.Struct({
      href: Schema.String,
    }),
    'password.reset': Schema.Struct({
      href: Schema.String,
    }),
    'password.set': Schema.Struct({
      href: Schema.String,
    }),
    'password.check': Schema.Struct({
      href: Schema.String,
    }),
    'password.recover': Schema.Struct({
      href: Schema.String,
    }),
    linkedAccounts: Schema.Struct({
      href: Schema.String,
    }),
    'account.sendVerificationCode': Schema.Struct({
      href: Schema.String,
    }),
  }),
  id: Schema.String,
  environment: Schema.Struct({
    id: Schema.String,
  }),
  population: Schema.Struct({
    id: Schema.String,
  }),
  createdAt: Schema.String,
  email: Schema.String,
  enabled: Schema.Boolean,
  lifecycle: Schema.Struct({
    status: Schema.String,
  }),
  mfaEnabled: Schema.Boolean,
  name: Schema.Struct({
    given: Schema.String,
    family: Schema.String,
  }),
  locales: Schema.Array(Schema.String),
  updatedAt: Schema.String,
  username: Schema.String,
});
export const getUsersResponse = Schema.Struct({
  _links: Schema.Struct({
    self: Schema.Struct({
      href: Schema.String,
    }),
    next: Schema.optional(
      Schema.Struct({
        href: Schema.String,
      }),
    ),
  }),
  _embedded: Schema.Struct({
    users: Schema.Array(
      Schema.Struct({
        _links: Schema.Struct({
          self: Schema.Struct({
            href: Schema.String,
          }),
          password: Schema.Struct({
            href: Schema.String,
          }),
          'password.set': Schema.Struct({
            href: Schema.String,
          }),
          'password.reset': Schema.Struct({
            href: Schema.String,
          }),
          'password.check': Schema.Struct({
            href: Schema.String,
          }),
          'password.recover': Schema.Struct({
            href: Schema.String,
          }),
          'account.sendVerificationCode': Schema.Struct({
            href: Schema.String,
          }),
          linkedAccounts: Schema.Struct({
            href: Schema.String,
          }),
        }),
        _embedded: Schema.Struct({
          password: Schema.Struct({
            environment: Schema.Struct({
              id: Schema.String,
            }),
            user: Schema.Struct({
              id: Schema.String,
            }),
            passwordPolicy: Schema.Struct({
              id: Schema.String,
            }),
            status: Schema.String,
            lastChangedAt: Schema.String,
          }),
        }),
        id: Schema.String,
        environment: Schema.Struct({
          id: Schema.String,
        }),
        account: Schema.Struct({
          canAuthenticate: Schema.Boolean,
          status: Schema.String,
        }),
        createdAt: Schema.String,
        email: Schema.String,
        enabled: Schema.Boolean,
        identityProvider: Schema.Struct({
          type: Schema.String,
        }),
        lastSignOn: Schema.optional(
          Schema.Struct({
            at: Schema.String,
            remoteIp: Schema.String,
          }),
        ),
        lifecycle: Schema.Struct({
          status: Schema.String,
        }),
        mfaEnabled: Schema.Boolean,
        name: Schema.Struct({
          given: Schema.String,
          family: Schema.String,
        }),
        population: Schema.Struct({
          id: Schema.String,
        }),
        updatedAt: Schema.String,
        username: Schema.String,
        verifyStatus: Schema.String,
      }),
    ),
  }),
  count: Schema.Number,
  size: Schema.Number,
});
