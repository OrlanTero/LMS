<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class PostCommentAbstract extends ModelDefaultFunctions
{
    public $post_comment_id;

    public $post_id;

    public $user_id;

    public $comment;

    public $date_created;

    public $status;
}