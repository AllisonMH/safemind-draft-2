import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ConversationAttributes {
  id: string;
  youthId: string;
  platform: string;
  conversationHash: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'isActive'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: string;
  public youthId!: string;
  public platform!: string;
  public conversationHash!: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    youthId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'youth',
        key: 'id',
      },
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    conversationHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'conversations',
    indexes: [
      {
        fields: ['youthId'],
      },
      {
        fields: ['conversationHash'],
      },
    ],
  }
);

export default Conversation;
