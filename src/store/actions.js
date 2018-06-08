export const TOGGLE_EDITOR = 'TOGGLE_EDITOR'
export const toggleEditor = () => ({ type: TOGGLE_EDITOR })

export const TOGGLE_TOOLBOX = 'TOGGLE_TOOLBOX'
export const toggleToolbox = () => ({ type: TOGGLE_TOOLBOX })

export const TOGGLE_CONFIG = 'TOGGLE_CONFIG'
export const toggleConfig = () => ({ type: TOGGLE_CONFIG })

export const COLLAPSE_MENUS = 'COLLAPSE_MENUS'
export const collapseMenus = () => ({ type: COLLAPSE_MENUS })


export const SCALE_1X = 'SCALE_1X'
export const scale1x = () => ({ type: SCALE_1X })

export const SCALE_2X = 'SCALE_2X'
export const scale2x = () => ({ type: SCALE_2X })

export const SCALE_4X = 'SCALE_4X'
export const scale4x = () => ({ type: SCALE_4X })

export const SET_TEXTURE0 = 'SET_TEXTURE0'
export const setTexture0 = (payload) => ({ type: SET_TEXTURE0, payload })



export const SET_SHADER_SOURCE = 'SET_SHADER_SOURCE'
export const setShaderSource = (payload) => ({ type: SET_SHADER_SOURCE, payload })

export const SET_EDITOR_SOURCE = 'SET_EDITOR_SOURCE'
export const setEditorSource = (payload) => ({ type: SET_EDITOR_SOURCE, payload })

export const COMPILE_SUCCESS = 'COMPILE_SUCCESS'
export const compileSuccess = (payload) => ({ type: COMPILE_SUCCESS, payload })

export const COMPILE_ERROR = 'COMPILE_ERROR'
export const compileError = (payload) => ({ type: COMPILE_ERROR, payload })

export const RESET = 'RESET'
export const reset = () => ({ type: RESET })

export const SELECT_EXAMPLE = 'SELECT_EXAMPLE'
export const selectExample = (payload) => ({ type: SELECT_EXAMPLE, payload })
