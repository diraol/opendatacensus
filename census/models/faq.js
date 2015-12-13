'use strict';

var mixins = require('./mixins');

module.exports = function(sequelize, DataTypes) {
  var Faq = sequelize.define('Faq', {
    priority: {
        type: DataTypes.INTEGER,
        primaryKey: false,
        allowNull: false,
        comment: 'Ordering the FAQ'
    },
    question: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      comment: 'Question to be answered.'
    },
    answer: {
      type: DataTypes.STRING,
      primaryKey: false,
      allowNull: false,
      comment: 'Answer of the Question.'
    },
    dataviz: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Dataviz to help answering the question.'
    },
    site: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      comment: 'Site this question belongs to. Composite key with id.'
    },
    translations: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  },
  {
    tableName: "faq",
    indexes: [
      {
        fields: ['site']
      }
    ],
    instanceMethods: {
      translated: mixins.translated
    },
  });

  return Faq;
};
