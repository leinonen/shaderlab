import { makeActionCreator } from '../utils/makeActionCreator'

export const TOGGLE_EDITOR = 'TOGGLE_EDITOR'
export const TOGGLE_TOOLBOX = 'TOGGLE_TOOLBOX'
export const TOGGLE_CONFIG = 'TOGGLE_CONFIG'
export const TOGGLE_FULLSCREEN = 'TOGGLE_FULLSCREEN'
export const COLLAPSE_MENUS = 'COLLAPSE_MENUS'
export const EDITOR_ALPHA = 'EDITOR_ALPHA'
export const SCALE_1X = 'SCALE_1X'
export const SCALE_2X = 'SCALE_2X'
export const SCALE_4X = 'SCALE_4X'
export const SET_TEXTURE0 = 'SET_TEXTURE0'
export const SET_TEXTURE1 = 'SET_TEXTURE1'
export const SET_TEXTURE2 = 'SET_TEXTURE2'
export const SET_TEXTURE3 = 'SET_TEXTURE3'
export const SET_SHADER_SOURCE = 'SET_SHADER_SOURCE'
export const SET_EDITOR_SOURCE = 'SET_EDITOR_SOURCE'
export const COMPILE_SUCCESS = 'COMPILE_SUCCESS'
export const COMPILE_ERROR = 'COMPILE_ERROR'
export const RESET = 'RESET'
export const SELECT_EXAMPLE = 'SELECT_EXAMPLE'

export default {
  toggleEditor: makeActionCreator(TOGGLE_EDITOR),
  toggleToolbox: makeActionCreator(TOGGLE_TOOLBOX),
  toggleConfig: makeActionCreator(TOGGLE_CONFIG),
  toggleFullscreen: makeActionCreator(TOGGLE_FULLSCREEN),
  collapseMenus: makeActionCreator(COLLAPSE_MENUS),
  setEditorAlpha: makeActionCreator(EDITOR_ALPHA, 'payload'),
  scale1x: makeActionCreator(SCALE_1X),
  scale2x: makeActionCreator(SCALE_2X),
  scale4x: makeActionCreator(SCALE_4X),
  setTexture0: makeActionCreator(SET_TEXTURE0, 'payload'),
  setTexture1: makeActionCreator(SET_TEXTURE1, 'payload'),
  setTexture2: makeActionCreator(SET_TEXTURE2, 'payload'),
  setTexture3: makeActionCreator(SET_TEXTURE3, 'payload'),
  setShaderSource: makeActionCreator(SET_SHADER_SOURCE, 'payload'),
  setEditorSource: makeActionCreator(SET_EDITOR_SOURCE, 'payload'),
  compileSuccess: makeActionCreator(COMPILE_SUCCESS, 'payload'),
  compileError: makeActionCreator(COMPILE_ERROR, 'payload'),
  reset: makeActionCreator(RESET),
  selectExample: makeActionCreator(SELECT_EXAMPLE, 'payload')
}
