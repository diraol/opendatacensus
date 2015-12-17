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
<<<<<<< HEAD:census/models/submitdata.js

    SAM: {
=======
    severeacutemalnutrition: {
>>>>>>> 604cdb68d091209e011b8ba5d5678068cdd1a28b:census/models/wash.js
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
<<<<<<< HEAD:census/models/submitdata.js
    lastUpdateSAM: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    GAN: {
=======
    severeacutemalnutritionUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    globalacutemalnutrition: {
>>>>>>> 604cdb68d091209e011b8ba5d5678068cdd1a28b:census/models/wash.js
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
<<<<<<< HEAD:census/models/submitdata.js
    lastUpdateGAN: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    ADD: {
=======
    globalacutemalnutritionUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    acutediarrhoealdisease: {
>>>>>>> 604cdb68d091209e011b8ba5d5678068cdd1a28b:census/models/wash.js
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
<<<<<<< HEAD:census/models/submitdata.js
    lastUpdateADD: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    HWAT: {
=======
    acutediarrhoealdiseaseUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    householdswithouttoilet: {
>>>>>>> 604cdb68d091209e011b8ba5d5678068cdd1a28b:census/models/wash.js
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
<<<<<<< HEAD:census/models/submitdata.js
    lastUpdateHWAT: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    HWAW: {
=======
    householdswithouttoiletUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    householdswithoutwater: {
>>>>>>> 604cdb68d091209e011b8ba5d5678068cdd1a28b:census/models/wash.js
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
<<<<<<< HEAD:census/models/submitdata.js
    lastUpdateHWAW: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    WSC: {
=======
    householdswithoutwaterUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    watterecoli: {
>>>>>>> 604cdb68d091209e011b8ba5d5678068cdd1a28b:census/models/wash.js
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
<<<<<<< HEAD:census/models/submitdata.js
    lastUpdateWSC: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    EXND: {
=======
    watterecoliUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
    eposuredisasters: {
>>>>>>> 604cdb68d091209e011b8ba5d5678068cdd1a28b:census/models/wash.js
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: ''
    },
<<<<<<< HEAD:census/models/submitdata.js
    lastUpdateEXND: {
=======
    eposuredisastersUpdate: {
>>>>>>> 604cdb68d091209e011b8ba5d5678068cdd1a28b:census/models/wash.js
      type: DataTypes.DATE,
      allowNull: false,
      comment: ''
    },
<<<<<<< HEAD:census/models/submitdata.js

    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime last update'
    },
    
=======
>>>>>>> 604cdb68d091209e011b8ba5d5678068cdd1a28b:census/models/wash.js
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
