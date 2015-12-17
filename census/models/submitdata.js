'use strict';

var _ = require('lodash');
var mixins = require('./mixins');

module.exports = function(sequelize, DataTypes) {
  var SubmitData = sequelize.define('SubmitData', {

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
      comment: 'Datetime last update'
    },
    GAN: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateGAN: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    ADD: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateADD: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    HWAT: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateHWAT: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    HWAW: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateHWAW: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    WSC: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateWSC: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    EXND: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    lastUpdateEXND: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: ''
    },
    organisation: {
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
    }


  },
  {
    tableName: 'submitdata',
    indexes: [
      {
        fields: ['site']
      }
    ],
    instanceMethods: {
      translated: mixins.translated
    },
    classMethods: {},
  });

  return SubmitData;
};
