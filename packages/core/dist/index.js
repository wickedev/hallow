'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jspb = require('google-protobuf');
var react = require('react');
var grpcWeb = require('@improbable-eng/grpc-web');

var Status;
(function (Status) {
    Status[Status["PENDING"] = 0] = "PENDING";
    Status[Status["FULLFILED"] = 1] = "FULLFILED";
    Status[Status["REJECTED"] = 2] = "REJECTED";
})(Status || (Status = {}));
class Resource {
    constructor(factory) {
        this.factory = factory;
        this.status = Status.PENDING;
        this.mustBeIgnored = true;
    }
    get canFetch() {
        return (!this.mustBeIgnored ||
            this.status === Status.FULLFILED ||
            this.status === Status.REJECTED);
    }
    read() {
        if (!this.suspender) {
            this.fetch();
        }
        switch (this.status) {
            case Status.PENDING:
                throw this.suspender;
            case Status.REJECTED:
                throw this.result;
            case Status.FULLFILED:
                return this.result;
        }
    }
    refresh() {
        var _a;
        if (!this.canFetch) {
            return;
        }
        this.status = Status.PENDING;
        this.suspender = undefined;
        this.result = undefined;
        this.fetch();
        (_a = this.forceUpdate) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    fetch() {
        const args = (this.arguments || []);
        this.suspender = this.factory(...args).then((r) => {
            this.status = Status.FULLFILED;
            this.result = r;
        }, (e) => {
            this.status = Status.REJECTED;
            this.result = e;
        });
    }
}

class StackTraceElementProto extends jspb.Message {
    static create(data) {
        const message = new StackTraceElementProto([]);
        message.className = data.className;
        message.methodName = data.methodName;
        message.fileName = data.fileName;
        message.lineNumber = data.lineNumber;
        return message;
    }
    static toObject(includeInstance, message) {
        return {
            className: message.className,
            methodName: message.methodName,
            fileName: message.fileName,
            lineNumber: message.lineNumber,
        };
    }
    static deserializeBinaryFromReader(message, reader) {
        while (reader.nextField()) {
            if (reader.isEndGroup()) {
                break;
            }
            const field = reader.getFieldNumber();
            switch (field) {
                case 1:
                    jspb.Message.setField(message, 1, reader.readString());
                    break;
                case 2:
                    jspb.Message.setField(message, 2, reader.readString());
                    break;
                case 3:
                    jspb.Message.setField(message, 3, reader.readString());
                    break;
                case 4:
                    jspb.Message.setField(message, 4, reader.readInt32());
                    break;
                default:
                    reader.skipField();
                    break;
            }
        }
        return message;
    }
    constructor(data) {
        super();
        jspb.Message.initialize(this, data, 0, -1, undefined, undefined);
    }
    get className() {
        return jspb.Message.getField(this, 1);
    }
    set className(value) {
        jspb.Message.setField(this, 1, value);
    }
    get methodName() {
        return jspb.Message.getField(this, 2);
    }
    set methodName(value) {
        jspb.Message.setField(this, 2, value);
    }
    get fileName() {
        return jspb.Message.getField(this, 3);
    }
    set fileName(value) {
        jspb.Message.setField(this, 3, value);
    }
    get lineNumber() {
        return jspb.Message.getField(this, 4);
    }
    set lineNumber(value) {
        jspb.Message.setField(this, 4, value);
    }
    serializeBinary() {
        const writer = new jspb.BinaryWriter();
        this.serializeBinaryToWriter(writer);
        return writer.getResultBuffer();
    }
    serializeBinaryToWriter(writer) {
        let v;
        if ((v = this.className) != null) {
            writer.writeString(1, v);
        }
        if ((v = this.methodName) != null) {
            writer.writeString(2, v);
        }
        if ((v = this.fileName) != null) {
            writer.writeString(3, v);
        }
        if ((v = this.lineNumber) != null) {
            writer.writeInt32(4, v);
        }
    }
    toObject(includeInstance = false) {
        return StackTraceElementProto.toObject(includeInstance, this);
    }
}
class ThrowableProto extends jspb.Message {
    constructor(data) {
        super();
        jspb.Message.initialize(this, data, 0, -1, ThrowableProto.repeatedFields_, undefined);
    }
    static create(data) {
        const message = new ThrowableProto([]);
        message.stackTraceList = data.stackTrace.map(StackTraceElementProto.create);
        return message;
    }
    static deserializeBinary(bytes) {
        return ThrowableProto.deserializeBinaryFromReader(new ThrowableProto([]), new jspb.BinaryReader(bytes));
    }
    static deserializeBinaryFromReader(message, reader) {
        while (reader.nextField()) {
            if (reader.isEndGroup()) {
                break;
            }
            const field = reader.getFieldNumber();
            switch (field) {
                case 1:
                    jspb.Message.setField(message, 1, reader.readString());
                    break;
                case 2:
                    jspb.Message.setField(message, 2, reader.readString());
                    break;
                case 3:
                    const value = new StackTraceElementProto(undefined);
                    reader.readMessage(value, StackTraceElementProto.deserializeBinaryFromReader);
                    message.addStackTraceElementProto(value);
                    break;
                case 4:
                    jspb.Message.setWrapperField(message, 1, ThrowableProto.deserializeBinaryFromReader(new ThrowableProto(undefined), reader));
                    break;
                default:
                    reader.skipField();
                    break;
            }
        }
        return message;
    }
    static toObject(includeInstance, message) {
        var _a;
        const list = jspb.Message.toObjectList(message.stackTraceList, StackTraceElementProto.toObject, includeInstance);
        return {
            originalClassName: message.originalClassName,
            originalMessage: message.originalMessage,
            stackTrace: list,
            cause: (_a = message.cause) === null || _a === void 0 ? void 0 : _a.toObject(),
        };
    }
    /*
    readonly originalClassName: string;
    readonly originalMessage: string;
    readonly stackTrace: IStackTraceElementProto[];
    readonly cause: IThrowableProto;
     */
    get originalClassName() {
        return jspb.Message.getField(this, 1);
    }
    set originalClassName(value) {
        jspb.Message.setField(this, 1, value);
    }
    get originalMessage() {
        return jspb.Message.getField(this, 2);
    }
    set originalMessage(value) {
        jspb.Message.setField(this, 2, value);
    }
    get stackTraceList() {
        return jspb.Message.getRepeatedWrapperField(this, StackTraceElementProto, 3);
    }
    set stackTraceList(value) {
        jspb.Message.setRepeatedWrapperField(this, 3, value);
    }
    get cause() {
        return jspb.Message.getWrapperField(this, ThrowableProto, 4);
    }
    set cause(value) {
        jspb.Message.setWrapperField(this, 4, value);
    }
    addStackTraceElementProto(value, opt_index) {
        return jspb.Message.addToRepeatedWrapperField(this, 3, value, StackTraceElementProto, opt_index);
    }
    serializeBinary() {
        const writer = new jspb.BinaryWriter();
        this.serializeBinaryToWriter(writer);
        return writer.getResultBuffer();
    }
    serializeBinaryToWriter(writer) {
        /* originalClassName */
        let v;
        if ((v = this.originalClassName) != null) {
            writer.writeString(1, v);
        }
        /* originalMessage */
        if ((v = this.originalMessage) != null) {
            writer.writeString(2, v);
        }
        /* stackTrace */
        const list = this.stackTraceList;
        if (list.length > 0) {
            writer.writeRepeatedMessage(3, list, StackTraceElementProto.serializeBinaryToWriter);
        }
        /* cause */
        if ((v = this.cause) != null) {
            writer.writeMessage(3, v, this.serializeBinaryToWriter);
        }
    }
    toObject(includeInstance = false) {
        return ThrowableProto.toObject(includeInstance, this);
    }
}
ThrowableProto.repeatedFields_ = [3];

const statusMap = {
    [grpcWeb.grpc.Code.OK]: "OK",
    [grpcWeb.grpc.Code.Canceled]: "Canceled",
    [grpcWeb.grpc.Code.Unknown]: "Unknown",
    [grpcWeb.grpc.Code.InvalidArgument]: "Invalid Argument",
    [grpcWeb.grpc.Code.DeadlineExceeded]: "Deadline Exceeded",
    [grpcWeb.grpc.Code.NotFound]: "NotFound",
    [grpcWeb.grpc.Code.AlreadyExists]: "Already Exists",
    [grpcWeb.grpc.Code.PermissionDenied]: "Permission Denied",
    [grpcWeb.grpc.Code.ResourceExhausted]: "Resource Exhausted",
    [grpcWeb.grpc.Code.FailedPrecondition]: "Failed Precondition",
    [grpcWeb.grpc.Code.Aborted]: "Aborted",
    [grpcWeb.grpc.Code.OutOfRange]: "Out Of Range",
    [grpcWeb.grpc.Code.Unimplemented]: "Unimplemented",
    [grpcWeb.grpc.Code.Internal]: "Internal",
    [grpcWeb.grpc.Code.Unavailable]: "Unavailable",
    [grpcWeb.grpc.Code.DataLoss]: "DataLoss",
    [grpcWeb.grpc.Code.Unauthenticated]: "Unauthenticated",
};
function getMessage(output) {
    return output.statusMessage || "Unknown Error";
}
function useForceUpdate() {
    const setValue = react.useState(0)[1];
    return react.useRef(() => setValue((v) => ~v)).current;
}

exports.Resource = Resource;
exports.StackTraceElementProto = StackTraceElementProto;
exports.ThrowableProto = ThrowableProto;
exports.getMessage = getMessage;
exports.statusMap = statusMap;
exports.useForceUpdate = useForceUpdate;
