import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AlertAttributes {
  id: string;
  analysisId: string;
  youthId: string;
  guardianId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'resolved' | 'escalated';
  message: string;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AlertCreationAttributes extends Optional<AlertAttributes, 'id' | 'status' | 'acknowledgedAt' | 'acknowledgedBy' | 'resolvedAt' | 'resolvedBy'> {}

class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  public id!: string;
  public analysisId!: string;
  public youthId!: string;
  public guardianId!: string;
  public severity!: 'low' | 'medium' | 'high' | 'critical';
  public status!: 'pending' | 'acknowledged' | 'resolved' | 'escalated';
  public message!: string;
  public acknowledgedAt?: Date;
  public acknowledgedBy?: string;
  public resolvedAt?: Date;
  public resolvedBy?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Alert.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    analysisId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'analyses',
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
    guardianId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'acknowledged', 'resolved', 'escalated'),
      defaultValue: 'pending',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    acknowledgedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'alerts',
    indexes: [
      {
        fields: ['youthId'],
      },
      {
        fields: ['guardianId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['severity'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Alert;
