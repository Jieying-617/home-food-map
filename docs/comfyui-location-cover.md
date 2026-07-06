# ComfyUI Location Cover Setup

Home Food Map can use a local ComfyUI workflow to turn a cabinet photo into a real AI cartoon cover.

## Recommended Model

- FLUX.1-schnell for a free local workflow.
- Use an image-to-image or reference-image workflow in ComfyUI so the generated cover follows the uploaded cabinet photo.

## Environment

```env
COMFYUI_BASE_URL="http://127.0.0.1:8188"
COMFYUI_WORKFLOW_PATH="D:/Learning/home-food-map/comfyui/location-cover-workflow.json"
```

## Workflow Placeholders

Export the ComfyUI workflow in API JSON format and put these placeholders where needed:

- `__INPUT_IMAGE__`: the uploaded cabinet photo name. Put this in the `LoadImage` node's image input.
- `__PROMPT__`: the positive prompt text.
- `__NEGATIVE_PROMPT__`: the negative prompt text.
- `__SEED__`: numeric seed for the sampler.

The app uploads the photo to ComfyUI, replaces placeholders, submits `/prompt`, polls `/history/{prompt_id}`, downloads the first output image from `/view`, and saves it as the location cover.

## Fallback

If ComfyUI is not configured, not running, or the workflow fails, the app saves the original photo and shows a clear message. It no longer uses the old local filter as if it were a true cartoon generation model.
