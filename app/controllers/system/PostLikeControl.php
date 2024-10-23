<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\PostLike;
use Application\controllers\app\Response;


class PostLikeControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = PostLike::class;
    protected $TABLE_NAME = "post_likes";
    protected $TABLE_PRIMARY_ID = "post_like_id";
    protected $SEARCH_LOOKUP = ["post_id", "user_id"];

    public function add($data)
    {
        global $SESSION;

        $post_id = $data['post_id'];

        $exists = $this->alreadyExists([
            "post_id" => $post_id,
            "user_id" => $SESSION->user_id
        ]);

        if ($exists->code == 200) {
            $this->removeRecord($exists->body['id']);

            return new Response(300, "Successfully Unliked", ["likes" => count($this->getPostLikes($post_id))]);
        } else {
             $this->addRecord([
                "post_id" => $post_id,
                "user_id" => $SESSION->user_id
            ]);

            return new Response(200, "Successfully Liked", ["likes" => count($this->getPostLikes($post_id))]);
        }
    }

    public function getPostLikes($post_id)
    {
        return $this->filterRecords(["post_id" => $post_id], true);
    }
}