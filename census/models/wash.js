'use strict';

var _ = require('lodash');
var mixins = require('./mixins');

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
    severeacutemalnutrition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    severeacutemalnutritionUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    globalacutemalnutrition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    globalacutemalnutritionUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    acutediarrhoealdisease: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    acutediarrhoealdiseaseUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    householdswithouttoilet: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    householdswithouttoiletUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    householdswithoutwater: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    householdswithoutwaterUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    watterecoli: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    watterecoliUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    eposuredisasters: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
    eposuredisastersUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
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
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'A flag to indicate if this is the current entry for ' +
        'this year/place/dataset.'
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
      translated: mixins.translated
    },
    classMethods: {},
  });

  return Wash;
};
