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

    severeacutemalnutrition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },

    globalacutemalnutrition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },

    acutediarrhoealdisease: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },


    householdswithouttoilet: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },

    householdswithoutwater: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },

    watterecoli: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    eposuredisasters: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },


    lastUpdate: {
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
