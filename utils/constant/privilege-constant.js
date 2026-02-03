const OPERATIONS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  PUBLISH: 'publish'
};

const RESOURCES = Object.freeze({
  PROFESSION: 'profession',
  LANGUAGE: 'language',
  TRIVIA_TYPE: 'triviaType',
  SOCIAL_LINK: 'socialLink',
  GENRE: 'genre',
  CELEBRITY: 'celebrity',
  SECTION_TYPE: 'sectionType',
  SECTION_TEMPLATE: 'sectionTemplate',
  ROLE_MANAGEMENT: 'roleManagement', 
  USER_MANAGEMENT: 'userManagement', 

})


const PRIVILEGE_RESOURCES = Object.freeze({

  LANGUAGE: 'language',
  TRIVIA_TYPE: 'triviaType',
  SOCIAL_LINK: 'socialLink',
  GENRE: 'genre',
  CELEBRITY: 'celebrity',
  SECTION_TYPE: 'sectionType',
  SECTION_TEMPLATE: 'sectionTemplate',

})

module.exports = {
  OPERATIONS,
  RESOURCES,
  PRIVILEGE_RESOURCES
};