/**
 * Получить случайное число от 0 до max
 *
 * @param {Number} max  Максимальное число
 */
exports.getRandomInt = function (max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Завершить дерево процессов
 *
 * @param {Number} PPID   Parent Process Identifier
 */
exports.killProcess = function (PPID) {
  try {
    const children = execSync(`ps -o pid --no-headers --ppid ${PPID}`)
      .toString()
      .split('\n')
      .slice(0, -1)
    for (const child of children) killTree(child)
  } catch {
    execSync(`kill -15 ${PPID}`)
  }
}

/**
 * Блокирование основного потока процесса
 *
 * @param   {Number} msec   Миллисекунды
 */
exports.msleep = function(msec) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, msec);
}
