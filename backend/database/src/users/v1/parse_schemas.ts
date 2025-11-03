const userCreateSchema = {
	type: 'object',
	required: ['username', 'password', 'email'],
	properties: {
		username: { type: 'string', minLength: 3, maxLength: 32 },
		username_in_tournaments: { type: 'string', minLength: 3, maxLength: 32 }, 
		password: { type: 'string', minLength: 2, maxLength: 128 },
		email: { type: 'string', format: 'email' },
		sub: {type: 'string', minLength: 3 },
	}
};

const userUpdateSchema = {
	type: 'object',
	required: ['username', 'password', 'email'],
	properties: {
		username: { type: 'string', minLength: 3, maxLength: 32 },
		username_in_tournaments: { type: 'string', minLength: 3, maxLength: 32 }, 
		password: { type: 'string', minLength: 2, maxLength: 128 },
		email: { type: 'string', format: 'email' },
		sub: {type: 'string', minLength: 3 },
		twoFASecret: { type: 'string' },
		is2faEnabled: { type: 'boolean' },
	}
};

const userUpdateTypesParams = {
  type: 'object',
  required: ['types', 'id'],
  properties: {
    types: {
      type: 'string',
      enum: ['username', 'password', 'email', 'username_in_tournaments', 'sub', 'two_fa_secret', 'is_fa_enabled'],
    },
    id: {
      type: 'string',
      pattern: '^[0-9]+$',
    },
  },
};

const userUpdateSchemaTypes = {
	type: 'object',
	required: ['data'],
	properties: {
		data: { type: 'string', minLength: 2, maxLength: 128 },
	}
};

const userEmailParamSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email' }
  }
};

export const schemas = {
	userCreateSchema,
	userUpdateSchema,
	userUpdateSchemaTypes,
	userUpdateTypesParams,
	userEmailParamSchema,
};