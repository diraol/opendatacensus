'use strict';

var _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  var Wash = sequelize.define('Wash', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: 'Unique identifier for this entry.'
    },
    site: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      comment: 'Site this dataset belongs to. Composite key with id.'
    },
    place: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Place this entry belongs to.'
    },
    SAM: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateSAM: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update SAM'
    },
    GAM: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateGAM: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update GAM'
    },
    ADD: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateADD: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update ADD'
    },
    HWAT: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateHWAT: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update HWAT'
    },
    HWAW: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateHWAW: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update HWAW'
    },
    WSC: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateWSC: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update WSC'
    },
    EXND: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateEXND: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: ''
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: ''
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: ''
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      },
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Record insert datetime'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Record update datetime'
    }
  },
  {
    tableName: 'wash',
    indexes: [
      {
        fields: ['site']
      }
    ],
    instanceMethods: {
      //translated: mixins.translated
    },
    classMethods: {},
  });

  return Wash;
};
