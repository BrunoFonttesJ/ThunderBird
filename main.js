const { ThunderBird } = require('./src/thunderbird')

const PORT = 3000

const thunderbird = new ThunderBird(max_payload_size_in_bytes = 1024)

const app = thunderbird.create()

app.listen(PORT, () => {
    console.info(`server bound at port ${PORT}`);
});

