const scaleAndUserIdSchema = {
  type: 'object',
  properties: {
    scale: { type: 'string', enum: ['global', 'only_1vs1', 'only_tournaments'] },
    user_id: {
      type: 'string',
      pattern: '^[0-9]+$'  
    }
  },
  required: ['scale', 'user_id']
};

export const gh_stats_schemas = {
	scaleAndUserIdSchema,
};