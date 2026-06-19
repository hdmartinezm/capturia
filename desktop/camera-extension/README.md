# Capturia Camera Extension (macOS)

Esta es la extensión de cámara virtual para macOS usando CMIOExtension framework.

## Requisitos

- macOS 12.3 o superior
- Xcode 14 o superior
- Apple Developer Account (para firmar la extensión)

## Estructura del Proyecto Xcode

Crea un nuevo proyecto en Xcode:

1. File → New → Project
2. Selecciona "Camera Extension" bajo macOS
3. Nombre: `CapturiaCameraExtension`
4. Bundle Identifier: `com.capturia.camera`

## Archivos a Crear

### 1. Info.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>Capturia Camera</string>
    <key>CFBundleIdentifier</key>
    <string>com.capturia.camera</string>
    <key>CFBundleName</key>
    <string>CapturiaCameraExtension</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.cmio.extension.provider</string>
        <key>NSExtensionPrincipalClass</key>
        <string>$(PRODUCT_MODULE_NAME).ExtensionProviderSource</string>
    </dict>
    <key>CMIOExtension</key>
    <dict>
        <key>CMIOExtensionMachServiceName</key>
        <string>com.capturia.camera</string>
    </dict>
</dict>
</plist>
```

### 2. ExtensionProviderSource.swift

```swift
import Foundation
import CoreMediaIO
import IOKit.audio
import os.log

let logger = Logger(subsystem: "com.capturia.camera", category: "Extension")

// MARK: - Extension Provider

class ExtensionProviderSource: NSObject, CMIOExtensionProviderSource {

    private(set) var provider: CMIOExtensionProvider!
    private var deviceSource: ExtensionDeviceSource!

    init(clientQueue: DispatchQueue?) {
        super.init()

        provider = CMIOExtensionProvider(source: self, clientQueue: clientQueue)
        deviceSource = ExtensionDeviceSource(localizedName: "Capturia Camera")

        do {
            try provider.addDevice(deviceSource.device)
        } catch {
            logger.error("Failed to add device: \(error.localizedDescription)")
        }
    }

    func connect(to client: CMIOExtensionClient) throws {
        logger.info("Client connected")
    }

    func disconnect(from client: CMIOExtensionClient) {
        logger.info("Client disconnected")
    }

    var availableProperties: Set<CMIOExtensionProperty> {
        return [.providerName, .providerManufacturer]
    }

    func providerProperties(forProperties properties: Set<CMIOExtensionProperty>) throws -> CMIOExtensionProviderProperties {
        let providerProperties = CMIOExtensionProviderProperties(dictionary: [:])
        if properties.contains(.providerName) {
            providerProperties.name = "Capturia Camera Provider"
        }
        if properties.contains(.providerManufacturer) {
            providerProperties.manufacturer = "Capturia"
        }
        return providerProperties
    }

    func setProviderProperties(_ providerProperties: CMIOExtensionProviderProperties) throws {
        // No settable properties
    }
}

// MARK: - Device Source

class ExtensionDeviceSource: NSObject, CMIOExtensionDeviceSource {

    private(set) var device: CMIOExtensionDevice!
    private var streamSource: ExtensionStreamSource!

    init(localizedName: String) {
        super.init()

        let deviceID = UUID()
        self.device = CMIOExtensionDevice(
            localizedName: localizedName,
            deviceID: deviceID,
            legacyDeviceID: nil,
            source: self
        )

        streamSource = ExtensionStreamSource(
            localizedName: "Capturia Camera Stream",
            deviceSource: self
        )

        do {
            try device.addStream(streamSource.stream)
        } catch {
            logger.error("Failed to add stream: \(error.localizedDescription)")
        }
    }

    var availableProperties: Set<CMIOExtensionProperty> {
        return [.deviceTransportType, .deviceModel]
    }

    func deviceProperties(forProperties properties: Set<CMIOExtensionProperty>) throws -> CMIOExtensionDeviceProperties {
        let deviceProperties = CMIOExtensionDeviceProperties(dictionary: [:])
        if properties.contains(.deviceTransportType) {
            deviceProperties.transportType = kIOAudioDeviceTransportTypeVirtual
        }
        if properties.contains(.deviceModel) {
            deviceProperties.model = "Capturia Virtual Camera"
        }
        return deviceProperties
    }

    func setDeviceProperties(_ deviceProperties: CMIOExtensionDeviceProperties) throws {
        // No settable properties
    }
}

// MARK: - Stream Source

class ExtensionStreamSource: NSObject, CMIOExtensionStreamSource {

    private(set) var stream: CMIOExtensionStream!
    private weak var deviceSource: ExtensionDeviceSource?

    private let width: Int32 = 1920
    private let height: Int32 = 1080
    private let frameRate: Float64 = 30.0

    private var frameTimer: DispatchSourceTimer?
    private var sequenceNumber: UInt64 = 0
    private var clients: Set<CMIOExtensionClient> = []

    // IPC file path
    private let framePath = "/tmp/capturia-camera-frame"
    private let metaPath = "/tmp/capturia-camera-frame.meta"

    init(localizedName: String, deviceSource: ExtensionDeviceSource) {
        self.deviceSource = deviceSource
        super.init()

        let streamID = UUID()
        let formatDescription = createFormatDescription()

        self.stream = CMIOExtensionStream(
            localizedName: localizedName,
            streamID: streamID,
            direction: .source,
            clockType: .hostTime,
            source: self
        )
    }

    private func createFormatDescription() -> CMFormatDescription {
        var formatDescription: CMFormatDescription?

        CMVideoFormatDescriptionCreate(
            allocator: kCFAllocatorDefault,
            codecType: kCVPixelFormatType_32BGRA,
            width: width,
            height: height,
            extensions: nil,
            formatDescriptionOut: &formatDescription
        )

        return formatDescription!
    }

    var formats: [CMIOExtensionStreamFormat] {
        let formatDescription = createFormatDescription()
        let format = CMIOExtensionStreamFormat(
            formatDescription: formatDescription,
            maxFrameDuration: CMTime(value: 1, timescale: Int32(frameRate)),
            minFrameDuration: CMTime(value: 1, timescale: Int32(frameRate)),
            validFrameDurations: nil
        )
        return [format]
    }

    var activeFormatIndex: Int = 0 {
        didSet {
            // Format changed
        }
    }

    var availableProperties: Set<CMIOExtensionProperty> {
        return [.streamActiveFormatIndex, .streamFrameDuration]
    }

    func streamProperties(forProperties properties: Set<CMIOExtensionProperty>) throws -> CMIOExtensionStreamProperties {
        let streamProperties = CMIOExtensionStreamProperties(dictionary: [:])

        if properties.contains(.streamActiveFormatIndex) {
            streamProperties.activeFormatIndex = 0
        }
        if properties.contains(.streamFrameDuration) {
            streamProperties.frameDuration = CMTime(value: 1, timescale: Int32(frameRate))
        }

        return streamProperties
    }

    func setStreamProperties(_ streamProperties: CMIOExtensionStreamProperties) throws {
        if let index = streamProperties.activeFormatIndex {
            activeFormatIndex = index
        }
    }

    func authorizedToStartStream(for client: CMIOExtensionClient) -> Bool {
        return true
    }

    func startStream() throws {
        logger.info("Starting stream")

        clients.removeAll()
        sequenceNumber = 0

        // Start frame timer
        let queue = DispatchQueue(label: "com.capturia.camera.frames")
        frameTimer = DispatchSource.makeTimerSource(queue: queue)
        frameTimer?.schedule(deadline: .now(), repeating: 1.0 / frameRate)
        frameTimer?.setEventHandler { [weak self] in
            self?.sendFrame()
        }
        frameTimer?.resume()
    }

    func stopStream() throws {
        logger.info("Stopping stream")

        frameTimer?.cancel()
        frameTimer = nil
    }

    private func sendFrame() {
        guard let pixelBuffer = readFrameFromFile() else {
            // If no frame file, generate test pattern
            guard let testBuffer = createTestPatternBuffer() else { return }
            outputFrame(pixelBuffer: testBuffer)
            return
        }

        outputFrame(pixelBuffer: pixelBuffer)
    }

    private func readFrameFromFile() -> CVPixelBuffer? {
        guard FileManager.default.fileExists(atPath: framePath) else {
            return nil
        }

        guard let frameData = try? Data(contentsOf: URL(fileURLWithPath: framePath)) else {
            return nil
        }

        // Create pixel buffer from frame data
        var pixelBuffer: CVPixelBuffer?
        let attributes: [String: Any] = [
            kCVPixelBufferCGImageCompatibilityKey as String: true,
            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
        ]

        CVPixelBufferCreate(
            kCFAllocatorDefault,
            Int(width),
            Int(height),
            kCVPixelFormatType_32BGRA,
            attributes as CFDictionary,
            &pixelBuffer
        )

        guard let buffer = pixelBuffer else { return nil }

        CVPixelBufferLockBaseAddress(buffer, [])
        defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

        guard let baseAddress = CVPixelBufferGetBaseAddress(buffer) else { return nil }

        let expectedSize = Int(width) * Int(height) * 4
        guard frameData.count >= expectedSize else { return nil }

        frameData.withUnsafeBytes { ptr in
            memcpy(baseAddress, ptr.baseAddress, expectedSize)
        }

        return buffer
    }

    private func createTestPatternBuffer() -> CVPixelBuffer? {
        var pixelBuffer: CVPixelBuffer?

        CVPixelBufferCreate(
            kCFAllocatorDefault,
            Int(width),
            Int(height),
            kCVPixelFormatType_32BGRA,
            nil,
            &pixelBuffer
        )

        guard let buffer = pixelBuffer else { return nil }

        CVPixelBufferLockBaseAddress(buffer, [])
        defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

        guard let baseAddress = CVPixelBufferGetBaseAddress(buffer) else { return nil }
        let bytesPerRow = CVPixelBufferGetBytesPerRow(buffer)

        // Fill with gradient
        for y in 0..<Int(height) {
            for x in 0..<Int(width) {
                let offset = y * bytesPerRow + x * 4
                let ptr = baseAddress.advanced(by: offset).assumingMemoryBound(to: UInt8.self)

                ptr[0] = UInt8(x * 255 / Int(width))  // B
                ptr[1] = UInt8(y * 255 / Int(height)) // G
                ptr[2] = 128                           // R
                ptr[3] = 255                           // A
            }
        }

        return buffer
    }

    private func outputFrame(pixelBuffer: CVPixelBuffer) {
        let timestamp = CMClockGetTime(CMClockGetHostTimeClock())

        guard let buffer = CMSampleBuffer.create(
            pixelBuffer: pixelBuffer,
            formatDescription: createFormatDescription(),
            timing: CMSampleTimingInfo(
                duration: CMTime(value: 1, timescale: Int32(frameRate)),
                presentationTimeStamp: timestamp,
                decodeTimeStamp: timestamp
            )
        ) else {
            return
        }

        sequenceNumber += 1

        stream.send(
            buffer,
            discontinuity: [],
            hostTimeInNanoseconds: UInt64(timestamp.seconds * 1_000_000_000)
        )
    }
}

// MARK: - CMSampleBuffer Extension

extension CMSampleBuffer {
    static func create(
        pixelBuffer: CVPixelBuffer,
        formatDescription: CMFormatDescription,
        timing: CMSampleTimingInfo
    ) -> CMSampleBuffer? {
        var sampleBuffer: CMSampleBuffer?
        var timingInfo = timing

        CMSampleBufferCreateReadyWithImageBuffer(
            allocator: kCFAllocatorDefault,
            imageBuffer: pixelBuffer,
            formatDescription: formatDescription,
            sampleTiming: &timingInfo,
            sampleBufferOut: &sampleBuffer
        )

        return sampleBuffer
    }
}
```

### 3. main.swift

```swift
import Foundation
import CoreMediaIO

let providerSource = ExtensionProviderSource(clientQueue: nil)
CMIOExtensionProvider.startService(provider: providerSource.provider)

CFRunLoopRun()
```

## Compilar e Instalar

1. Abre el proyecto en Xcode
2. Selecciona "Any Mac" como destino
3. Build (Cmd+B)
4. Product → Archive (para distribución)

## Instalar la Extensión

```bash
# Copiar la extensión al directorio de sistema
sudo cp -R CapturiaCameraExtension.appex /Library/SystemExtensions/

# O instalar vía systemextensionsctl (requiere app container)
systemextensionsctl install com.capturia.camera
```

## Verificar Instalación

```bash
# Listar extensiones
systemextensionsctl list

# Ver logs
log stream --predicate 'subsystem == "com.capturia.camera"'
```

## Depuración

Para depurar, asegúrate de que:

1. La app tiene los entitlements correctos
2. El archivo `/tmp/capturia-camera-frame` existe
3. El archivo tiene el tamaño correcto (1920 * 1080 * 4 bytes = 8,294,400 bytes)

```bash
# Verificar archivo de frame
ls -la /tmp/capturia-camera-frame

# Ver contenido del metadata
cat /tmp/capturia-camera-frame.meta
```
