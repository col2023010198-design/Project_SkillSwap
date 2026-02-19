export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  rating: number;
  title: string;
  description: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-[#2d3f47] rounded-lg p-4 border border-[#3a4f5a] hover:border-[#5fa4c3] transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5fa4c3] to-[#4a7a8d] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{post.author.name}</h3>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-xs ${i < Math.floor(post.rating) ? 'text-yellow-400' : 'text-gray-600'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400">@{post.author.username}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-300">⋮</button>
      </div>

      <h4 className="font-medium text-white mb-2">{post.title}</h4>
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{post.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-[#3a4f5a] pt-3">
        <span>{post.timestamp}</span>
        <div className="flex gap-4">
          <button className="hover:text-[#5fa4c3] transition-colors flex items-center gap-1">
            ❤️ {post.likes}
          </button>
          <button className="hover:text-[#5fa4c3] transition-colors flex items-center gap-1">
            💬 {post.comments}
          </button>
        </div>
      </div>
    </div>
  );
}
