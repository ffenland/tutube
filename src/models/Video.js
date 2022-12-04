import mongoose, { mongo } from "mongoose";

export const formatHashtags = (hashtags) => {
  // 별도의 함수를 만드는게 2번째 방법
  return hashtags
    .split(",")
    .filter((word) => word.trim().length !== 0)
    .map((word) =>
      word.startsWith("#") ? word.trim() : "#".concat(word.trim())
    );
};

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  fileUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true, minLength: 10 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String }],
  category: { type: String, required: true },
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
    favs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

// 3번째 방법은 static을 이용하는 법.
videoSchema.static("formatHashtags", (hashtags) =>
  hashtags
    .split(",")
    .filter((word) => word.trim().length !== 0)
    .map((word) =>
      word.startsWith("#") ? word.trim() : "#".concat(word.trim())
    )
);

//middleware는 모델 선언 전에 해주어야 한다.
// videoSchema.pre("save", async function () {
//   // this는 저장하려는 문서(객체) = arrow function 불가
//   // hashtag를 raw상태의 input으로 받아서 여기서 처리하자.
//   // this.hashtag는 schema에 의해 Array형태로 변환되어 넘어온다.
//   this.hashtags = this.hashtags[0]
//   .split(",")
//   .filter((word) => word.trim().length !== 0)
//   .map((word) =>
//     word.startsWith("#") ? word.trim() : "#".concat(word.trim())
//   );

//   // findByIdAndUpdate 에는 적용할 수 없으므로 일단 주석처리.
//   // formatHashtags 함수를 만들어 처리.
// });

const Video = mongoose.model("Video", videoSchema);

export default Video;
