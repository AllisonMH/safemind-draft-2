import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AnalysisAttributes {
  id: string;
  conversationId: string;
  youthId: string;
  text: string;
  textHash: string;
  toxicityScore: number;
  severeToxicityScore: number;
  obsceneScore: number;
  threatScore: number;
  insultScore: number;
  identityAttackScore: number;
  isHarmful: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  categoriesExceeded: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnalysisCreationAttributes extends Optional<AnalysisAttributes, 'id'> {}

class Analysis extends Model<AnalysisAttributes, AnalysisCreationAttributes> implements AnalysisAttributes {
  public id!: string;
  public conversationId!: string;
  public youthId!: string;
  public text!: string;
  public textHash!: string;
  public toxicityScore!: number;
  public severeToxicityScore!: number;
  public obsceneScore!: number;
  public threatScore!: number;
  public insultScore!: number;
  public identityAttackScore!: number;
  public isHarmful!: boolean;
  public riskLevel!: 'low' | 'medium' | 'high' | 'critical';
  public categoriesExceeded!: string[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Analysis.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id',
      },
    },
    youthId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'youth',
        key: 'id',
      },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    textHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    toxicityScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    severeToxicityScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    obsceneScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    threatScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    insultScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    identityAttackScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    isHarmful: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'low',
    },
    categoriesExceeded: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'analyses',
    indexes: [
      {
        fields: ['conversationId'],
      },
      {
        fields: ['youthId'],
      },
      {
        fields: ['isHarmful'],
      },
      {
        fields: ['riskLevel'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Analysis;
