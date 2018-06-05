
export const SET_SHADER_SOURCE = 'SET_SHADER_SOURCE'
export const setShaderSource = (payload) => ({ type: SET_SHADER_SOURCE, payload })

export const SET_EDITOR_SOURCE = 'SET_EDITOR_SOURCE'
export const setEditorSource = (payload) => ({ type: SET_EDITOR_SOURCE, payload })

export const TOGGLE_EDITOR = 'TOGGLE_EDITOR'
export const toggleEditor = () => ({ type: TOGGLE_EDITOR })

export const TOGGLE_TOOLBOX = 'TOGGLE_TOOLBOX'
export const toggleToolbox = () => ({ type: TOGGLE_TOOLBOX })

export const TOGGLE_CONFIG = 'TOGGLE_CONFIG'
export const toggleConfig = () => ({ type: TOGGLE_CONFIG })

export const COMPILE_SUCCESS = 'COMPILE_SUCCESS'
export const compileSuccess = (payload) => ({ type: COMPILE_SUCCESS, payload })

export const COMPILE_ERROR = 'COMPILE_ERROR'
export const compileError = (payload) => ({ type: COMPILE_ERROR, payload })

export const RESET = 'RESET'
export const reset = () => ({ type: RESET })

export const SELECT_EXAMPLE = 'SELECT_EXAMPLE'
export const selectExample = (payload) => ({ type: SELECT_EXAMPLE, payload })
