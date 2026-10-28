// The workbench's own settings. Every key it stores starts with `keyPrefix`; every key a story's units store
// starts with `stagePrefix`, inside the stage frame. Neither can overwrite the other, or a real site's keys.
export const config = {
  keyPrefix: 'wb-',
  stagePrefix: 'test-',
  port: 4400
}
