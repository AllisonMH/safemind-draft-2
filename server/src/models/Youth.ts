import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface YouthAttributes {
  id: string;
  guardianId: string;
  firstName: string;
  lastName: string;
  age: number;
  monitoringEnabled: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt?: Date;
  updatedAt?: Date;
}

interface YouthCreationAttributes extends Optional<YouthAttributes, 'id' | 'monitoringEnabled' | 'riskLevel'> {}

class Youth extends Model<YouthAttributes, YouthCreationAttributes> implements YouthAttributes {
  public id!: string;
  public guardianId!: string;
  public firstName!: string;
  public lastName!: string;
  public age!: number;
  public monitoringEnabled!: boolean;
  public riskLevel!: 'low' | 'medium' | 'high' | 'critical';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Youth.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    guardianId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 17,
      },
    },
    monitoringEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'low',
    },
  },
  {
    sequelize,
    tableName: 'youth',
    indexes: [
      {
        fields: ['guardianId'],
      },
      {
        fields: ['riskLevel'],
      },
    ],
  }
);

export default Youth;
