
import mongoose, { Schema, model } from 'mongoose'

const projectGroupSchema = new Schema({
    color: { type: String, required: true },
    purpose: { type: String, required: true },
    projectName: { type: String, required: true },
    workPhases: { type: Object, required: true },
});

const ProjectGroups = mongoose.models?.ProjectGroups || model('ProjectGroups', projectGroupSchema)

export default ProjectGroups