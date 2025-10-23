import cron from 'node-cron'
import { exec } from 'child_process'

console.log('🕒 Scheduler iniciado...')

// Rodar todos os dias às 3h da manhã
cron.schedule('0 3 * * *', () => {
  console.log('🧩 Executando atualização automática dos sinais e histórico...')
  exec(
    'npm run update:signals && npm run update:history',
    (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Erro no cron job:', err)
        return
      }
      console.log(stdout)
    },
  )
})
