import User from './User';
import Youth from './Youth';
import Conversation from './Conversation';
import Analysis from './Analysis';
import Alert from './Alert';

// Define associations
User.hasMany(Youth, { foreignKey: 'guardianId', as: 'youth' });
Youth.belongsTo(User, { foreignKey: 'guardianId', as: 'guardian' });

Youth.hasMany(Conversation, { foreignKey: 'youthId', as: 'conversations' });
Conversation.belongsTo(Youth, { foreignKey: 'youthId', as: 'youth' });

Conversation.hasMany(Analysis, { foreignKey: 'conversationId', as: 'analyses' });
Analysis.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

Youth.hasMany(Analysis, { foreignKey: 'youthId', as: 'analyses' });
Analysis.belongsTo(Youth, { foreignKey: 'youthId', as: 'youth' });

Analysis.hasMany(Alert, { foreignKey: 'analysisId', as: 'alerts' });
Alert.belongsTo(Analysis, { foreignKey: 'analysisId', as: 'analysis' });

Youth.hasMany(Alert, { foreignKey: 'youthId', as: 'alerts' });
Alert.belongsTo(Youth, { foreignKey: 'youthId', as: 'youth' });

User.hasMany(Alert, { foreignKey: 'guardianId', as: 'alerts' });
Alert.belongsTo(User, { foreignKey: 'guardianId', as: 'guardian' });

export {
  User,
  Youth,
  Conversation,
  Analysis,
  Alert,
};
